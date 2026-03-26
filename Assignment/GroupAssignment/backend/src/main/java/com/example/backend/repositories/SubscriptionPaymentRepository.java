package com.example.backend.repositories;

import com.example.backend.entities.SubscriptionPayment;
import com.example.backend.entities.SubscriptionPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, UUID> {
    @Query("SELECT sp FROM SubscriptionPayment sp " +
           "LEFT JOIN FETCH sp.targetPackage " +
           "LEFT JOIN FETCH sp.subscription s " +
           "LEFT JOIN FETCH s.aPackage " +
           "WHERE sp.payOsOrderCode = :orderCode")
    Optional<SubscriptionPayment> findByPayOsOrderCode(@Param("orderCode") Long payOsOrderCode);

    boolean existsByPayOsOrderCode(long orderCode);

    List<SubscriptionPayment> findAllBySubscription_Restaurant_RestaurantIdOrderByDateDesc(UUID restaurantId);

    // Optimized: Fetch only top 10 most recent payments
    List<SubscriptionPayment> findTop10BySubscription_Restaurant_RestaurantIdOrderByDateDesc(UUID restaurantId);

    @Query(value = """
                SELECT
                    u.user_id AS user_id,
                    u.username AS username,
                    u.email AS email,
                    COALESCE(SUM(sp.amount), 0) AS total_spent
                FROM subscription_payment sp
                JOIN subscription s ON sp.subscription_id = s.subscription_id
                JOIN restaurant r ON s.restaurant_id = r.restaurant_id
                JOIN users u ON r.user_id = u.user_id
                WHERE sp.subscription_payment_status = 'SUCCESS'
                GROUP BY u.user_id, u.username, u.email
                ORDER BY total_spent DESC
                LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> findTopSpenders(@Param("limit") int limit);
    List<SubscriptionPayment> findAllBySubscription_SubscriptionId(UUID subscriptionId);
    List<SubscriptionPayment> findAllBySubscriptionPaymentStatusAndExpiredAtBefore(
            SubscriptionPaymentStatus status, Instant time
    );

    // Statistics queries - Payment stats by date range
    @Query("""
        SELECT 
            p.name,
            COUNT(CASE WHEN sp.purpose = 'NEW_SUBSCRIPTION' THEN 1 END),
            COUNT(CASE WHEN sp.purpose = 'RENEW' THEN 1 END),
            COUNT(CASE WHEN sp.purpose = 'UPGRADE' THEN 1 END),
            COALESCE(SUM(sp.amount), 0)
        FROM SubscriptionPayment sp
        JOIN sp.subscription s
        JOIN s.aPackage p
        WHERE sp.subscriptionPaymentStatus = 'SUCCESS'
        AND sp.date >= :startDate AND sp.date <= :endDate
        GROUP BY p.packageId, p.name
        ORDER BY p.name
        """)
    List<Object[]> findPackageStatsByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query("""
        SELECT 
            COALESCE(SUM(sp.amount), 0)
        FROM SubscriptionPayment sp
        WHERE sp.subscriptionPaymentStatus = 'SUCCESS'
        AND sp.date >= :startDate AND sp.date <= :endDate
        """)
    Long findTotalRevenueByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query(value = """
        SELECT 
            DATE(sp.date) as payment_date,
            COALESCE(SUM(sp.amount), 0) as daily_revenue,
            COUNT(sp.subscription_payment_id) as transaction_count
        FROM subscription_payment sp
        WHERE sp.subscription_payment_status = 'SUCCESS'
        AND sp.date >= :startDate AND sp.date <= :endDate
        GROUP BY DATE(sp.date)
        ORDER BY payment_date
        """, nativeQuery = true)
    List<Object[]> findDailyRevenueByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
