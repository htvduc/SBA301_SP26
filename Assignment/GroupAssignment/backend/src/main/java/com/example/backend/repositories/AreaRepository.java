package com.example.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Area;
import com.example.backend.entities.EntityStatus;

@Repository
public interface AreaRepository extends JpaRepository<Area, UUID> {
    
    List<Area> findByBranch_BranchId(UUID branchId);
    
    Page<Area> findByBranch_BranchId(UUID branchId, Pageable pageable);
    
    List<Area> findByBranch_BranchIdAndStatus(UUID branchId, EntityStatus status);
    
    Page<Area> findByBranch_BranchIdAndStatus(UUID branchId, EntityStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Area a WHERE a.branch.restaurant.restaurantId = :restaurantId")
    List<Area> findByRestaurantId(@Param("restaurantId") UUID restaurantId);
    
    @Query("SELECT a FROM Area a WHERE a.branch.restaurant.user.userId = :ownerId")
    List<Area> findByOwnerId(@Param("ownerId") UUID ownerId);
    
    boolean existsByBranch_BranchIdAndName(UUID branchId, String name);
}
