package com.example.backend.repositories;

import com.example.backend.entities.MenuItem;
import com.example.backend.entities.EntityStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findAllByRestaurant_RestaurantIdAndStatus(UUID restaurantId, EntityStatus status);
    List<MenuItem> findAllByRestaurant_RestaurantIdAndStatusIn(UUID restaurantId, List<EntityStatus> statuses);
    long countByRestaurant_RestaurantIdAndStatusNot(UUID restaurantId, EntityStatus status);
}
