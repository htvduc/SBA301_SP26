package com.example.backend.dto.response;

import com.example.backend.entities.SubscriptionStatus;

import java.time.LocalDate;
import java.util.UUID;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private UUID subscriptionId;
    private UUID restaurantId;
    private UUID packageId;
    private SubscriptionStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amount;
    private String checkoutUrl;
    private String paymentStatus;
    private SubscriptionPaymentResponse paymentInfo;
}