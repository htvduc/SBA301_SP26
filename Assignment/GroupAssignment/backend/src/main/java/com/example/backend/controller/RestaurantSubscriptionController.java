package com.example.backend.controller;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.services.RestaurantSubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/restaurant-subscriptions")
public class RestaurantSubscriptionController {

    private final RestaurantSubscriptionService restaurantSubscriptionService;

    public RestaurantSubscriptionController(RestaurantSubscriptionService restaurantSubscriptionService) {
        this.restaurantSubscriptionService = restaurantSubscriptionService;
    }

    @PostMapping("/create")
    public ApiResponse<SubscriptionPaymentResponse> createRestaurantWithSubscription(
            @RequestBody RestaurantCreateRequest request,
            @RequestParam UUID packageId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.createRestaurantWithSubscriptionAndPayment(request, packageId));
        return res;
    }

    @PostMapping("/renew/{restaurantId}")
    public ApiResponse<SubscriptionPaymentResponse> renewSubscription(@PathVariable UUID restaurantId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.renewSubscription(restaurantId));
        return res;
    }

    @PostMapping("/upgrade/{restaurantId}")
    public ApiResponse<SubscriptionPaymentResponse> upgradePackage(
            @PathVariable UUID restaurantId,
            @RequestParam UUID newPackageId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.upgradePackage(restaurantId, newPackageId));
        return res;
    }
}
