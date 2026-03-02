package fpt.sba301.repository;

import fpt.sba301.entity.BookingDetail;
import fpt.sba301.entity.BookingDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingDetailRepository
        extends JpaRepository<BookingDetail, BookingDetailId> {

    boolean existsByRoom_RoomID(Integer roomID);

    @Query("SELECT DISTINCT bd.room.roomID FROM BookingDetail bd " +
           "WHERE bd.bookingReservation.bookingStatus = 1 " +
           "AND bd.startDate <= :reqEnd AND bd.endDate >= :reqStart")
    List<Integer> findOccupiedRoomIds(
            @Param("reqStart") LocalDate reqStart,
            @Param("reqEnd") LocalDate reqEnd
    );

    @Query("SELECT DISTINCT bd.room.roomID FROM BookingDetail bd " +
           "WHERE bd.startDate = :today " +
           "AND bd.bookingReservation.bookingStatus = :status")
    List<Integer> findRoomIdsByStartDateAndStatus(
            @Param("today") LocalDate today,
            @Param("status") Integer status
    );

    // helper used by scheduled task or when changing reservation status
    @Query("SELECT COUNT(bd) > 0 FROM BookingDetail bd " +
           "WHERE bd.room.roomID = :roomId " +
           "AND bd.bookingReservation.bookingStatus = 1 " +
           "AND bd.endDate >= :today")
    boolean existsActiveBookingForRoom(
            @Param("roomId") Integer roomId,
            @Param("today") LocalDate today
    );
}
