package fpt.sba301.controller;

import fpt.sba301.dto.BookingDetailRequest;
import fpt.sba301.dto.CreateBookingRequest;
import fpt.sba301.entity.BookingDetail;
import fpt.sba301.entity.BookingDetailId;
import fpt.sba301.entity.BookingReservation;
import fpt.sba301.entity.Customer;
import fpt.sba301.entity.RoomInformation;
import fpt.sba301.repository.BookingReservationRepository;
import fpt.sba301.repository.CustomerRepository;
import fpt.sba301.repository.RoomInformationRepository;
import fpt.sba301.service.CustomerService;
import fpt.sba301.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository;
    private final BookingReservationRepository bookingReservationRepository;
    private final RoomInformationRepository roomInformationRepository;
    private final RoomService roomService;

    private Customer getCurrentCustomer(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Customer) {
            return (Customer) principal;
        }

        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            return customerRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        throw new RuntimeException("Invalid authentication principal");
    }

    // ----- Profile -----

    @GetMapping("/profile")
    public Customer getProfile(Authentication authentication) {
        return getCurrentCustomer(authentication);
    }

    @PutMapping("/profile")
    public Customer updateProfile(Authentication authentication,
            @RequestBody Customer updateRequest) {
        Customer current = getCurrentCustomer(authentication);
        return customerService.update(current.getCustomerID(), updateRequest);
    }

    // ----- Booking history -----

    @GetMapping("/bookings")
    @Transactional(readOnly = true)
    public List<BookingReservation> getMyBookings(Authentication authentication) {
        Customer current = getCurrentCustomer(authentication);
        return bookingReservationRepository.findByCustomer_CustomerID(current.getCustomerID());
    }

    // ----- Create booking with details -----

    @PostMapping("/bookings")
    @Transactional
    public ResponseEntity<BookingReservation> createBooking(
            Authentication authentication,
            @RequestBody CreateBookingRequest request) {
        Customer current = getCurrentCustomer(authentication);

        BookingReservation reservation = new BookingReservation();
        reservation.setBookingDate(
                request.getBookingDate() != null ? request.getBookingDate() : LocalDate.now());
        reservation.setTotalPrice(request.getTotalPrice());
        reservation.setBookingStatus(
                request.getBookingStatus() != null ? request.getBookingStatus() : 0);
        reservation.setCustomer(current);

        // save reservation first to get an ID (flush to ensure identity is generated)
        BookingReservation savedReservation = bookingReservationRepository.saveAndFlush(reservation);

        List<BookingDetail> details = new ArrayList<>();
        if (request.getDetails() != null) {
            for (BookingDetailRequest d : request.getDetails()) {
                if (d == null)
                    continue;
                if (d.getRoomID() == null || d.getStartDate() == null || d.getEndDate() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Booking detail is missing required fields");
                }
                if (!d.getEndDate().isAfter(d.getStartDate())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "End date must be after start date");
                }

                RoomInformation room = roomInformationRepository.findById(d.getRoomID())
                        .orElseThrow(() -> new RuntimeException("Room not found: " + d.getRoomID()));

                if (!roomService.isRoomAvailable(room.getRoomID(), d.getStartDate(), d.getEndDate())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Room " + room.getRoomNumber()
                                    + " is not available for the selected dates. Please select different dates or another room.");
                }

                BookingDetail detail = new BookingDetail();
                // Explicitly set the composite key ID
                BookingDetailId detailId = new BookingDetailId();
                detailId.setBookingReservationID(savedReservation.getBookingReservationID());
                detailId.setRoomID(room.getRoomID());
                detail.setId(detailId);
                
                detail.setBookingReservation(savedReservation);
                detail.setRoom(room);
                detail.setStartDate(d.getStartDate());
                detail.setEndDate(d.getEndDate());
                detail.setActualPrice(d.getActualPrice() != null ? d.getActualPrice() : room.getRoomPricePerDay());

                details.add(detail);
            }
        }

        if (!details.isEmpty()) {
            savedReservation.setBookingDetails(details);
            // cascade from reservation will persist details with correct foreign keys
            savedReservation = bookingReservationRepository.saveAndFlush(savedReservation);
        }

        return ResponseEntity.ok(savedReservation);
    }

    // ----- Change password -----

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(Authentication authentication,
            @RequestBody java.util.Map<String, String> request) {
        Customer current = getCurrentCustomer(authentication);
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        if (oldPassword == null || newPassword == null || newPassword.length() < 3) {
            return ResponseEntity.badRequest().body("Invalid password data");
        }
        try {
            customerService.changePassword(current.getCustomerID(), oldPassword, newPassword);
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
