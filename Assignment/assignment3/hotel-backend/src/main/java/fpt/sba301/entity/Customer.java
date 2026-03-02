package fpt.sba301.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer customerID;

    @Column(nullable = false)
    private String customerFullName;

    private String telephone;

    @Column(unique = true)
    private String email;

    private LocalDate customerBirthday;

    private Integer customerStatus;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "customer")
    @JsonIgnore
    private List<BookingReservation> bookings;
}
