package fpt.sba301.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "RoomInformation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "roomid")
    private Integer roomID;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "room_detail_description")
    private String roomDetailDescription;

    @Column(name = "room_max_capacity")
    private Integer roomMaxCapacity;

    /**
     * 0 = inactive/unavailable
     * 1 = available/active
     * 2 = reserved/booked (staff has approved a reservation)
     *    automatically returns to 1 after end date or when booking is removed
     */
    @Column(name = "room_status")
    private Integer roomStatus;

    @Column(name = "room_price_per_day")
    private BigDecimal roomPricePerDay;

    @ManyToOne
    @JoinColumn(name = "room_typeid")
    private RoomType roomType;

    @OneToMany(mappedBy = "room")
    @JsonIgnore
    private List<BookingDetail> bookingDetails;

    /** True when room is in an approved booking covering today. Set by service before serialization. */
    @Transient
    @JsonProperty("occupied")
    private Boolean occupied;
}
