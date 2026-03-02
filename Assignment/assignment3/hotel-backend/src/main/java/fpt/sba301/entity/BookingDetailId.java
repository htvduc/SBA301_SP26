package fpt.sba301.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BookingDetailId implements Serializable {

    @Column(name = "booking_reservationid")
    private Integer bookingReservationID;

    @Column(name = "roomid")
    private Integer roomID;
}
