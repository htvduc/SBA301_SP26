package com.example.backend.repositories;

import com.example.backend.entities.RestaurantReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RestaurantReportRepository extends JpaRepository<RestaurantReport, UUID> {
    
    @Query("SELECT rr FROM RestaurantReport rr WHERE rr.restaurant.restaurantId = :restaurantId ORDER BY rr.createDate DESC")
    List<RestaurantReport> findByRestaurantIdOrderByCreateDateDesc(@Param("restaurantId") UUID restaurantId);
    
    @Query("SELECT rr FROM RestaurantReport rr WHERE rr.restaurant.restaurantId = :restaurantId AND rr.createDate >= :fromDate ORDER BY rr.createDate DESC")
    List<RestaurantReport> findByRestaurantIdAndCreateDateAfter(@Param("restaurantId") UUID restaurantId, @Param("fromDate") LocalDateTime fromDate);
    
    Optional<RestaurantReport> findTopByRestaurantRestaurantIdOrderByCreateDateDesc(UUID restaurantId);
}