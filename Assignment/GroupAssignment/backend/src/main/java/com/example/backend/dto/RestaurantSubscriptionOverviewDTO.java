package com.example.backend.dto;

import com.example.backend.dto.response.SubscriptionPaymentResponse;

import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSubscriptionOverviewDTO {
    private static final long serialVersionUID = 1L;
    private UUID restaurantId;
    private String restaurantName;
    private CurrentSubscriptionOverviewDTO currentSubscription;
    private List<SubscriptionPaymentResponse> paymentHistory;
}