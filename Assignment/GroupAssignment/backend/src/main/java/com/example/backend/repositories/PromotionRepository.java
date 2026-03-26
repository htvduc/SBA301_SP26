package com.example.backend.repositories;

import com.example.backend.entities.Promotion;
import com.example.backend.entities.PromotionType;
import com.example.backend.entities.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    Optional<Promotion> findByCodeAndStatus(String code, PromotionStatus status);
    List<Promotion> findAllByRestaurant_RestaurantIdAndStatusNot(UUID restaurantId, PromotionStatus status);
    List<Promotion> findAllByRestaurant_RestaurantIdAndStatus(UUID restaurantId, PromotionStatus status);

    @Query("SELECT p FROM Promotion p JOIN p.menuItems m " +
           "WHERE p.restaurant.restaurantId = :restaurantId " +
           "AND p.status = 'ACTIVE' " +
           "AND m.menuItemId IN :menuItemIds " +
           "AND p.startDate < :endDate " +
           "AND p.endDate > :startDate " +
           "AND (:excludePromotionId IS NULL OR p.promotionId <> :excludePromotionId)")
    List<Promotion> findOverlappingPromotions(
            UUID restaurantId, 
            Set<UUID> menuItemIds, 
            Instant startDate, 
            Instant endDate, 
            UUID excludePromotionId);

    @Query("SELECT p FROM Promotion p JOIN p.menuItems m " +
           "WHERE m.menuItemId = :menuItemId " +
           "AND p.status = 'ACTIVE' " +
           "AND p.promotionType = 'MENU_ITEM' " +
           "AND p.startDate <= :now " +
           "AND p.endDate >= :now")
    Optional<Promotion> findActivePromotionForMenuItem(UUID menuItemId, Instant now);

    Optional<Promotion> findByRestaurant_RestaurantIdAndCodeIgnoreCaseAndStatus(
            UUID restaurantId, String code, PromotionStatus status);

    List<Promotion> findAllByRestaurant_RestaurantIdAndPromotionTypeAndStatus(
            UUID restaurantId, PromotionType promotionType, PromotionStatus status);
}
