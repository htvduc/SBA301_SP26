package com.example.backend.dto;

import com.example.backend.entities.SubscriptionStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CurrentSubscriptionOverviewDTO {
    private static final long serialVersionUID = 1L;
    private UUID subscriptionId;
    private UUID packageId;
    private String packageName;
    private SubscriptionStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal amount;
}