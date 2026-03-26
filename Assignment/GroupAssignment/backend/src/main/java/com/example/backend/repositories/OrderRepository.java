package com.example.backend.repositories;

import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o WHERE o.areaTable.areaTableId = :tableId AND o.status = :status")
    Optional<Order> findByAreaTable_AreaTableIdAndStatus(@Param("tableId") UUID tableId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.areaTable.areaTableId = :tableId ORDER BY o.createdAt DESC")
    List<Order> findByAreaTable_AreaTableIdOrderByCreatedAtDesc(@Param("tableId") UUID tableId);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a WHERE a.branch.branchId = :branchId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByBranchIdAndStatus(@Param("branchId") UUID branchId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a WHERE a.branch.branchId = :branchId ORDER BY o.createdAt DESC")
    List<Order> findByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (o.status = 'COMPLETED' OR o.status = 'CANCELLED') " +
           "ORDER BY o.createdAt DESC")
    List<Order> findHistoryByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o JOIN FETCH o.areaTable t JOIN FETCH t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (o.status = 'COMPLETED' OR o.status = 'CANCELLED') " +
           "ORDER BY o.updatedAt DESC")
    List<Order> findHistoryOrdersLightByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT ol.order.orderId, COUNT(oi) FROM OrderItem oi JOIN oi.orderLine ol " +
           "WHERE ol.order.orderId IN :orderIds AND oi.status = 'ACTIVE' " +
           "GROUP BY ol.order.orderId")
    List<Object[]> countActiveItemsByOrderIds(@Param("orderIds") List<UUID> orderIds);

    @EntityGraph(attributePaths = {"areaTable", "areaTable.area"})
    @Query("SELECT DISTINCT o FROM Order o JOIN o.areaTable t JOIN t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (o.createdAt >= COALESCE(:startDate, o.createdAt)) " +
           "AND (o.createdAt <= COALESCE(:endDate, o.createdAt)) " +
           "AND (COALESCE(:searchTerm, 'ALL') = 'ALL' OR LOWER(t.tag) LIKE :searchTerm OR LOWER(CAST(o.orderId as string)) LIKE :searchTerm)")
    Page<Order> searchOrders(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

            @Query("""
        SELECT COUNT(o)
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    int countOrdersByBranchAndStatusAndTimeframe(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Count orders by status using {@code updatedAt} (e.g. cancellations counted on cancel day,
     * aligns daily analytics when completion/cancel time differs from {@code createdAt}).
     */
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.updatedAt >= :startDate
        AND o.updatedAt < :endDate
    """)
    int countOrdersByBranchAndStatusAndUpdatedAtRange(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Calculate total revenue by branch and timeframe (COMPLETED orders only)
     */
    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0)
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    BigDecimal sumRevenueByBranchAndTimeframe(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Find top selling items by branch and timeframe
     * Note: Limiting is handled in the service layer
     */
    @Query("""
        SELECT new com.example.backend.dto.TopSellingItemDTO(
            mi.menuItemId,
            mi.name,
            CAST(SUM(oi.quantity) AS int),
            SUM(oi.totalPrice)
        )
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = 'ACTIVE'
        GROUP BY mi.menuItemId, mi.name
        ORDER BY SUM(oi.totalPrice) DESC
    """)
    List<TopSellingItemDTO> findTopSellingItemsByBranch(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Get order distribution by hour for a specific date
     */
    @Query("""
        SELECT new com.example.backend.dto.OrderDistributionDTO(
            HOUR(o.createdAt),
            COUNT(o)
        )
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        GROUP BY HOUR(o.createdAt)
        ORDER BY HOUR(o.createdAt)
    """)
    List<OrderDistributionDTO> findOrderDistributionByBranchAndDate(
            @Param("branchId") UUID branchId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT o.createdAt
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.branchId = :branchId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    List<Instant> findOrderCreatedTimesByBranchAndDate(
            @Param("branchId") UUID branchId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT mi.menuItemId, mi.name, oi.quantity, oi.totalPrice, o.totalPrice, COALESCE(b.finalPrice, o.totalPrice)
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch br
        LEFT JOIN Bill b ON b.order = o
        WHERE br.branchId = :branchId
        AND br.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = 'ACTIVE'
    """)
    List<Object[]> findTopSellingItemRowsByBranch(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Find top selling items by restaurant and timeframe (aggregated from all branches)
     */
    @Query("""
        SELECT new com.example.backend.dto.TopSellingItemDTO(
            mi.menuItemId,
            mi.name,
            CAST(SUM(oi.quantity) AS int),
            SUM(oi.totalPrice)
        )
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.restaurant.restaurantId = :restaurantId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = 'ACTIVE'
        GROUP BY mi.menuItemId, mi.name
        ORDER BY SUM(oi.totalPrice) DESC
    """)
    List<TopSellingItemDTO> findTopSellingItemsByRestaurant(
            @Param("restaurantId") UUID restaurantId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Get order distribution by hour for a restaurant (aggregated from all branches)
     */
    @Query("""
        SELECT new com.example.backend.dto.OrderDistributionDTO(
            HOUR(o.createdAt),
            COUNT(o)
        )
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.restaurant.restaurantId = :restaurantId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        GROUP BY HOUR(o.createdAt)
        ORDER BY HOUR(o.createdAt)
    """)
    List<OrderDistributionDTO> findOrderDistributionByRestaurantAndDate(
            @Param("restaurantId") UUID restaurantId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT o.createdAt
        FROM Order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch b
        WHERE b.restaurant.restaurantId = :restaurantId
        AND b.isActive = true
        AND a.status = 'ACTIVE'
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
    """)
    List<Instant> findOrderCreatedTimesByRestaurantAndDate(
            @Param("restaurantId") UUID restaurantId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    @Query("""
        SELECT mi.menuItemId, mi.name, oi.quantity, oi.totalPrice, o.totalPrice, COALESCE(b.finalPrice, o.totalPrice)
        FROM OrderItem oi
        JOIN oi.menuItem mi
        JOIN oi.orderLine ol
        JOIN ol.order o
        JOIN o.areaTable at
        JOIN at.area a
        JOIN a.branch br
        LEFT JOIN Bill b ON b.order = o
        WHERE br.restaurant.restaurantId = :restaurantId
        AND br.isActive = true
        AND a.status = 'ACTIVE'
        AND o.status = :status
        AND o.createdAt >= :startDate
        AND o.createdAt < :endDate
        AND oi.status = 'ACTIVE'
    """)
    List<Object[]> findTopSellingItemRowsByRestaurant(
            @Param("restaurantId") UUID restaurantId,
            @Param("status") OrderStatus status,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );
}
