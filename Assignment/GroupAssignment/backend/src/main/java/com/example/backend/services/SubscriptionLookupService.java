package com.example.backend.services;

import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.entities.Package;

import java.util.UUID;

@Service
public class SubscriptionLookupService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionLookupService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true, noRollbackFor = AppException.class)
    public Package getActivePackageByRestaurant(UUID restaurantId) {
        return subscriptionRepository.findActivePackageByRestaurantId(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE));
    }
}
