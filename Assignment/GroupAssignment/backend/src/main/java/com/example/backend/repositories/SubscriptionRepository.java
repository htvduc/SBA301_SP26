package com.example.backend.repositories;

import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.backend.entities.Package;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(UUID restaurantId);

    List<Subscription> findAllByStatus(SubscriptionStatus status);

    Optional<Subscription> findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(
            UUID restaurantId,
            SubscriptionStatus status);

    List<Subscription> findAllByRestaurant_RestaurantId(UUID restaurantId);

    @Query("""
                SELECT s.aPackage
                FROM Subscription s
                WHERE s.restaurant.restaurantId = :restaurantId
                  AND s.status = 'ACTIVE'
            """)
    Optional<Package> findActivePackageByRestaurantId(UUID restaurantId);

    @Query("""
            SELECT s FROM Subscription s
            JOIN FETCH s.aPackage
            WHERE s.restaurant.restaurantId = :restaurantId
              AND s.status = 'ACTIVE'
            ORDER BY s.createdAt DESC
            """)
    Optional<Subscription> findActiveSubscriptionByRestaurantId(UUID restaurantId);

    long countByRestaurant_RestaurantId(UUID restaurantId);

    @Query("""
            SELECT DISTINCT s
            FROM Subscription s
            JOIN FETCH s.aPackage p
            LEFT JOIN FETCH s.subscriptionPayments pay
            """)
    List<Subscription> findAllWithPayments();

    @Query("SELECT s FROM Subscription s WHERE s.endDate BETWEEN :fromDate AND :toDate AND s.status = 'ACTIVE'")
    List<Subscription> findSubscriptionsExpiringBetween(LocalDate fromDate, LocalDate toDate);

    // Statistics queries
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.status = 'ACTIVE'")
    Long countActiveSubscriptions();

    // Check if package has active subscriptions
    @Query("SELECT COUNT(s) > 0 FROM Subscription s WHERE s.aPackage.packageId = :packageId AND s.status = 'ACTIVE'")
    boolean existsActiveSubscriptionsByPackageId(UUID packageId);

    // Count active subscriptions for a package
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.aPackage.packageId = :packageId AND s.status = 'ACTIVE'")
    Long countActiveSubscriptionsByPackageId(UUID packageId);

    // Get active subscription distribution by package (for Package Distribution stats)
    @Query("""
        SELECT p.name, COUNT(s)
        FROM Subscription s
        JOIN s.aPackage p
        WHERE s.status = 'ACTIVE'
        GROUP BY p.packageId, p.name
        ORDER BY p.name
        """)
    List<Object[]> findActiveSubscriptionDistribution();
}
