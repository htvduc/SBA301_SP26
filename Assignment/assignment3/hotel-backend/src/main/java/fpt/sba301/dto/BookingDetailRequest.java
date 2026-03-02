package fpt.sba301.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailRequest {

    private Integer roomID;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal actualPrice;
}

