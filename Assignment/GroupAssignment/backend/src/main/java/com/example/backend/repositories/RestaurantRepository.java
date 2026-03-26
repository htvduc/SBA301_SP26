package com.example.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    List<Restaurant> findByUser_UserId(UUID userId);

    Page<Restaurant> findByStatus(Pageable pageable, boolean status);

    // Removed @EntityGraph to avoid eager fetching nested collections
    // Use separate optimized queries instead
    List<Restaurant> findAllByUser_UserId(UUID userId);

    @Query("SELECT r FROM Restaurant r WHERE r.publicUrl LIKE %:suffix")
    List<Restaurant> findByPublicUrlEndingWith(@Param("suffix") String suffix);
    
    boolean existsByPublicUrl(String publicUrl);
    
    @Query("SELECT r FROM Restaurant r WHERE r.publicUrl = :baseSlug OR r.publicUrl LIKE CONCAT(:baseSlug, '-%')")
    List<Restaurant> findByPublicUrlStartingWith(@Param("baseSlug") String baseSlug);

    Optional<Restaurant> findByPublicUrl(String publicUrl);
}