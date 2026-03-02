package fpt.sba301.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    private LocalDate bookingDate;
    private BigDecimal totalPrice;
    private Integer bookingStatus; // optional, can be null -> default in service
    private List<BookingDetailRequest> details;
}

