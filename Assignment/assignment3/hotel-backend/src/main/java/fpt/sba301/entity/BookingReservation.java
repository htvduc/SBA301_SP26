package fpt.sba301.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "BookingReservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_reservationid")
    private Integer bookingReservationID;

    @Column(name = "booking_date")
    private LocalDate bookingDate;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "booking_status")
    private Integer bookingStatus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customerid")
    private Customer customer;

    @OneToMany(mappedBy = "bookingReservation", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<BookingDetail> bookingDetails;
}
