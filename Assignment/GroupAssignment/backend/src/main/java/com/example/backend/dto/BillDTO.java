package com.example.backend.dto;

import com.example.backend.entities.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private UUID billId;
    private UUID orderId;
    private UUID branchId;
    private String tableName;
    private String areaName;
    private BigDecimal finalPrice;
    private BigDecimal discountAmount;
    private String promotionCode;
    private String promotionName;
    private String note;
    private PaymentMethod paymentMethod;
    private Instant paidTime;
    private Instant createdAt;
    private OrderDTO order;
    private String restaurantName;
    private String branchName;
    private String branchAddress;
    private String branchPhone;
}
