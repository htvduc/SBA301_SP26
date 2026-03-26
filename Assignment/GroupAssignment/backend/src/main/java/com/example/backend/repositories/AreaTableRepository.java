package com.example.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.AreaTable;
import com.example.backend.entities.TableStatus;

@Repository
public interface AreaTableRepository extends JpaRepository<AreaTable, UUID> {
    
    List<AreaTable> findByArea_AreaId(UUID areaId);
    
    Page<AreaTable> findByArea_AreaId(UUID areaId, Pageable pageable);
    
    List<AreaTable> findByArea_AreaIdAndStatus(UUID areaId, TableStatus status);
    
    Page<AreaTable> findByArea_AreaIdAndStatus(UUID areaId, TableStatus status, Pageable pageable);
    
    @Query("SELECT t FROM AreaTable t WHERE t.area.branch.branchId = :branchId")
    List<AreaTable> findByBranchId(@Param("branchId") UUID branchId);
    
    List<AreaTable> findByArea_Branch_BranchId(UUID branchId);
    
    @Query("SELECT t FROM AreaTable t WHERE t.area.branch.branchId = :branchId")
    Page<AreaTable> findByBranchId(@Param("branchId") UUID branchId, Pageable pageable);
    
    @Query("SELECT t FROM AreaTable t WHERE t.area.branch.restaurant.restaurantId = :restaurantId")
    List<AreaTable> findByRestaurantId(@Param("restaurantId") UUID restaurantId);
    
    boolean existsByArea_AreaIdAndTag(UUID areaId, String tag);
    
    Optional<AreaTable> findByQr(String qr);
}
