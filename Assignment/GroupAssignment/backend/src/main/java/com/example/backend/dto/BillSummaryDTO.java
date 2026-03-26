package com.example.backend.dto;

import com.example.backend.entities.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillSummaryDTO {
    private UUID billId;
    private UUID orderId;
    private String tableName;
    private String areaName;
    private BigDecimal finalPrice;
    private PaymentMethod paymentMethod;
    private Instant paidTime;
}
