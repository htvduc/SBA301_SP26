package com.example.backend.repositories;

import com.example.backend.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.backend.entities.EntityStatus;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    @Query("""
                SELECT c FROM Category c
                WHERE (c.restaurant.restaurantId = :restaurantId OR c.restaurant IS NULL)
                AND c.status = :status
            """)
    List<Category> findAllByRestaurantAndStatus(
            @Param("restaurantId") UUID restaurantId,
            @Param("status") EntityStatus status);
}
