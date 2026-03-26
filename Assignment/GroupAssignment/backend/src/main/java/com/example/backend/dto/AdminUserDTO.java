package com.example.backend.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AdminUserDTO {
    private UUID userId;
    private String email;
    private String username;
    private String roleName;
    private String status;
    private Instant createdAt;
    private List<RestaurantSummaryDTO> restaurants;

    public AdminUserDTO() {}

    public AdminUserDTO(UUID userId, String email, String username, String roleName, 
                       String status, Instant createdAt, List<RestaurantSummaryDTO> restaurants) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.roleName = roleName;
        this.status = status;
        this.createdAt = createdAt;
        this.restaurants = restaurants;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<RestaurantSummaryDTO> getRestaurants() {
        return restaurants;
    }

    public void setRestaurants(List<RestaurantSummaryDTO> restaurants) {
        this.restaurants = restaurants;
    }

    public static class RestaurantSummaryDTO {
        private UUID restaurantId;
        private String name;
        private boolean status;
        private Instant createdAt;

        public RestaurantSummaryDTO() {}

        public RestaurantSummaryDTO(UUID restaurantId, String name, boolean status, Instant createdAt) {
            this.restaurantId = restaurantId;
            this.name = name;
            this.status = status;
            this.createdAt = createdAt;
        }

        // Getters and Setters
        public UUID getRestaurantId() {
            return restaurantId;
        }

        public void setRestaurantId(UUID restaurantId) {
            this.restaurantId = restaurantId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isStatus() {
            return status;
        }

        public void setStatus(boolean status) {
            this.status = status;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}