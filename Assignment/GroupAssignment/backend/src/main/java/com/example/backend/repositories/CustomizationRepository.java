package com.example.backend.repositories;

import com.example.backend.entities.Customization;
import com.example.backend.entities.EntityStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomizationRepository extends JpaRepository<Customization, UUID> {

    List<Customization> findAllByRestaurant_RestaurantIdAndStatus(
            UUID restaurantId,
            EntityStatus status
    );

    long countByCategories_CategoryIdAndStatus(
            UUID categoryId,
            EntityStatus status
    );

    List<Customization> findAllByCategories_CategoryIdAndStatus(
            UUID categoryId,
            EntityStatus status
    );
}