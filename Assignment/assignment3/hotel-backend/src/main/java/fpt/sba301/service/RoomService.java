package fpt.sba301.service;

import fpt.sba301.entity.RoomInformation;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {

    List<RoomInformation> getAllRooms();

    /**
     * Get rooms available for the given date range.
     * Excludes rooms that are in approved bookings overlapping [startDate,
     * endDate].
     * Also excludes rooms with roomStatus != 1 (Available).
     */
    List<RoomInformation> getAvailableRooms(LocalDate startDate, LocalDate endDate);

    RoomInformation getById(Integer id);

    RoomInformation create(RoomInformation room);

    RoomInformation update(Integer id, RoomInformation room);

    /**
     * Delete room information if it does not belong to any booking transaction.
     * If the room already exists in booking details, only change its status (e.g.
     * inactive).
     */
    void delete(Integer id);

    /**
     * Check if room is available for the date range (no approved booking overlap).
     */
    boolean isRoomAvailable(Integer roomId, LocalDate startDate, LocalDate endDate);

    /**
     * Get all rooms with occupied flag set (for staff). Occupied = in approved
     * booking covering today.
     */
    List<RoomInformation> getRoomsForStaff();

    /**
     * Get all rooms with occupied flag set for a specific date.
     * Used by the public homepage to show which rooms are booked.
     */
    List<RoomInformation> getAllRoomsWithStatus(LocalDate checkDate);
}
