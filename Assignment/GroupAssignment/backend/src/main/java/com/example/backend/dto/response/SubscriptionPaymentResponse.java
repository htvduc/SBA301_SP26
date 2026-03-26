package com.example.backend.dto.response;

import com.example.backend.entities.SubscriptionPaymentPurpose;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPaymentResponse {
    private static final long serialVersionUID = 1L;
    private UUID subscriptionPaymentId;
    private BigDecimal amount;
    private String payOsOrderCode;
    private String payOsTransactionCode;
    private String qrCodeUrl;
    private String accountNumber;
    private String accountName;
    private Instant expiredAt;
    private String description;
    private String subscriptionPaymentStatus;
    private Instant date;
    private Integer proratedAmount;
    private SubscriptionPaymentPurpose purpose;
    private UUID restaurantId;
    private String restaurantName;
}