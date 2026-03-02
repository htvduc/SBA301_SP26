package fpt.sba301.controller;

import fpt.sba301.dto.UpdateBookingStatusRequest;
import fpt.sba301.entity.BookingReservation;
import fpt.sba301.repository.BookingReservationRepository;
import fpt.sba301.repository.RoomInformationRepository;
import fpt.sba301.repository.BookingDetailRepository;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/staff/bookings")
@RequiredArgsConstructor
public class StaffBookingController {

    private final BookingReservationRepository bookingReservationRepository;
    private final fpt.sba301.repository.RoomInformationRepository roomInformationRepository;
    private final fpt.sba301.repository.BookingDetailRepository bookingDetailRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<BookingReservation> getAllBookings() {
        return bookingReservationRepository.findAllWithDetails();
    }

    // allow staff to delete a reservation; caller should only delete older or
    // irrelevant bookings but we do not enforce complex rules here
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Integer id) {
        BookingReservation reservation = bookingReservationRepository.findById(id)
                .orElse(null);
        if (reservation == null) {
            return ResponseEntity.notFound().build();
        }
        // before deletion, release any rooms that were reserved by this booking
        if (reservation.getBookingDetails() != null) {
            LocalDate today = LocalDate.now();
            reservation.getBookingDetails().forEach(d -> {
                var room = d.getRoom();
                if (room != null) {
                    boolean hasOther = bookingDetailRepository.existsActiveBookingForRoom(
                            room.getRoomID(), today);
                    if (!hasOther) {
                        room.setRoomStatus(1);
                        roomInformationRepository.save(room);
                    }
                }
            });
        }
        bookingReservationRepository.delete(reservation);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<BookingReservation> updateStatus(
            @PathVariable Integer id,
            @RequestBody UpdateBookingStatusRequest request
    ) {
        BookingReservation reservation = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking reservation not found"));

        Integer oldStatus = reservation.getBookingStatus();
        reservation.setBookingStatus(request.getStatus());
        BookingReservation saved = bookingReservationRepository.save(reservation);

        // when a reservation is approved, mark associated rooms as "booked" (2)
        if (request.getStatus() != null && request.getStatus() == 1) {
            if (saved.getBookingDetails() != null) {
                saved.getBookingDetails().forEach(d -> {
                    var room = d.getRoom();
                    if (room != null) {
                        room.setRoomStatus(2);
                        roomInformationRepository.save(room);
                    }
                });
            }
        }

        // if we changed away from approved (cancelled or other) and the previous
        // status was approved, attempt to release rooms if they have no other
        // active bookings
        if (oldStatus != null && oldStatus == 1 && !saved.getBookingStatus().equals(1)) {
            if (saved.getBookingDetails() != null) {
                LocalDate today = LocalDate.now();
                saved.getBookingDetails().forEach(d -> {
                    var room = d.getRoom();
                    if (room != null) {
                        boolean hasOther = bookingDetailRepository.existsActiveBookingForRoom(
                                room.getRoomID(), today);
                        if (!hasOther) {
                            room.setRoomStatus(1);
                            roomInformationRepository.save(room);
                        }
                    }
                });
            }
        }

        return ResponseEntity.ok(saved);
    }
}

