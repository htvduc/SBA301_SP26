package fpt.sba301.repository;

import fpt.sba301.entity.BookingReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingReservationRepository extends JpaRepository<BookingReservation, Integer> {

    @Query("SELECT DISTINCT b FROM BookingReservation b " +
           "LEFT JOIN FETCH b.bookingDetails bd " +
           "LEFT JOIN FETCH bd.room " +
           "WHERE b.customer.customerID = :customerId")
    List<BookingReservation> findByCustomer_CustomerID(@Param("customerId") Integer customerId);

    @Query("SELECT DISTINCT b FROM BookingReservation b " +
           "LEFT JOIN FETCH b.bookingDetails bd " +
           "LEFT JOIN FETCH bd.room")
    List<BookingReservation> findAllWithDetails();
}
