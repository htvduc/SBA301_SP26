package fpt.sba301.service;

import fpt.sba301.entity.RoomInformation;
import fpt.sba301.repository.BookingDetailRepository;
import fpt.sba301.repository.RoomInformationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.scheduling.annotation.Scheduled;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomInformationRepository repository;
    private final BookingDetailRepository bookingDetailRepository;

    @Override
    public List<RoomInformation> getAllRooms() {
        return repository.findAll();
    }

    @Override
    public List<RoomInformation> getAvailableRooms(LocalDate startDate, LocalDate endDate) {
        List<RoomInformation> all = repository.findAll();
        List<Integer> occupiedIds = bookingDetailRepository.findOccupiedRoomIds(startDate, endDate);
        return all.stream()
                .filter(r -> r.getRoomStatus() != null && r.getRoomStatus() == 1)
                .filter(r -> !occupiedIds.contains(r.getRoomID()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean isRoomAvailable(Integer roomId, LocalDate startDate, LocalDate endDate) {
        RoomInformation room = repository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
        // Room must not be inactive (status 0)
        if (room.getRoomStatus() == null || room.getRoomStatus() == 0) {
            return false;
        }
        // Check for booking overlap regardless of roomStatus value
        List<Integer> occupiedIds = bookingDetailRepository.findOccupiedRoomIds(startDate, endDate);
        return !occupiedIds.contains(roomId);
    }

    @Override
    public List<RoomInformation> getRoomsForStaff() {
        LocalDate today = LocalDate.now();
        List<RoomInformation> rooms = repository.findAll();
        List<Integer> occupiedIds = bookingDetailRepository.findOccupiedRoomIds(today, today);
        rooms.forEach(r -> r.setOccupied(occupiedIds.contains(r.getRoomID())));
        return rooms;
    }

    @Override
    public List<RoomInformation> getAllRoomsWithStatus(LocalDate checkDate) {
        List<RoomInformation> rooms = repository.findAll();
        List<Integer> occupiedIds = bookingDetailRepository.findOccupiedRoomIds(checkDate, checkDate);
        rooms.forEach(r -> r.setOccupied(occupiedIds.contains(r.getRoomID())));
        return rooms;
    }

    @Override
    public RoomInformation getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    @Override
    public RoomInformation create(RoomInformation room) {
        room.setRoomID(null);
        return repository.save(room);
    }

    @Override
    public RoomInformation update(Integer id, RoomInformation room) {
        RoomInformation existing = getById(id);

        existing.setRoomNumber(room.getRoomNumber());
        existing.setRoomDetailDescription(room.getRoomDetailDescription());
        existing.setRoomMaxCapacity(room.getRoomMaxCapacity());
        existing.setRoomStatus(room.getRoomStatus());
        existing.setRoomPricePerDay(room.getRoomPricePerDay());
        existing.setRoomType(room.getRoomType());

        return repository.save(existing);
    }

    /**
     * periodic job that will:
     * 1. revert rooms marked as "booked" (status = 2) back to active (status = 1)
     *    once there are no more approved reservations that overlap today or later.
     * 2. mark rooms as booked (status = 2) for any approved reservation whose
     *    start date is today.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void cleanupExpiredBookings() {
        LocalDate today = LocalDate.now();
        // release stale bookings
        List<RoomInformation> booked = repository.findAll().stream()
                .filter(r -> r.getRoomStatus() != null && r.getRoomStatus() == 2)
                .collect(Collectors.toList());
        for (RoomInformation r : booked) {
            boolean hasActive = bookingDetailRepository.existsActiveBookingForRoom(r.getRoomID(), today);
            if (!hasActive) {
                r.setRoomStatus(1);
                repository.save(r);
            }
        }

        // apply new bookings that start today
        List<Integer> willStart = bookingDetailRepository.findRoomIdsByStartDateAndStatus(today, 1);
        for (Integer roomId : willStart) {
            RoomInformation r = repository.findById(roomId).orElse(null);
            if (r != null && (r.getRoomStatus() == null || r.getRoomStatus() != 2)) {
                r.setRoomStatus(2);
                repository.save(r);
            }
        }
    }

    @Override
    public void delete(Integer id) {
        // If room is referenced in any booking detail, only change status
        boolean usedInBooking = bookingDetailRepository.existsByRoom_RoomID(id);

        if (usedInBooking) {
            RoomInformation room = getById(id);
            // 0 = inactive/unavailable
            room.setRoomStatus(0);
            repository.save(room);
        } else {
            repository.deleteById(id);
        }
    }
}