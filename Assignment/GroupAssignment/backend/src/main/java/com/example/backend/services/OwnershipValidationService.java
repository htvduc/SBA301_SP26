package com.example.backend.services;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.backend.entities.Restaurant;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.utils.SecurityUtil;

@Service
public class OwnershipValidationService {

    private final RestaurantRepository restaurantRepository;
    private final SecurityUtil securityUtil;

    public OwnershipValidationService(
            RestaurantRepository restaurantRepository,
            SecurityUtil securityUtil) {
        this.restaurantRepository = restaurantRepository;
        this.securityUtil = securityUtil;
    }

    public void validateRestaurantOwnership(Restaurant restaurant) {
        User currentUser = securityUtil.getCurrentUser();
        if (!restaurant.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    public void validateRestaurantOwnership(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        validateRestaurantOwnership(restaurant);
    }

    public boolean isRestaurantOwner(UUID restaurantId) {
        try {
            validateRestaurantOwnership(restaurantId);
            return true;
        } catch (AppException e) {
            return false;
        }
    }
}