package com.example.backend.repositories;

import com.example.backend.entities.Reservation;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.entities.Branch;
import com.example.backend.entities.AreaTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByBranch(Branch branch);

    List<Reservation> findByAreaTable(AreaTable areaTable);

    List<Reservation> findByBranch_BranchId(UUID branchId);

    List<Reservation> findByAreaTable_AreaTableId(UUID areaTableId);

    List<Reservation> findByBranch_BranchIdAndStatusIn(UUID branchId, List<ReservationStatus> statuses);

    List<Reservation> findByBranch_BranchIdAndStartTimeBetween(UUID branchId, LocalDateTime startDate, LocalDateTime endDate);

    List<Reservation> findByBranch_BranchIdAndStatusInAndStartTimeBetween(UUID branchId, List<ReservationStatus> statuses, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT r FROM Reservation r WHERE r.branch.branchId = :branchId " +
           "AND (LOWER(r.customerName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.customerPhone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Reservation> searchByCustomerInfo(@Param("branchId") UUID branchId, @Param("search") String search);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.branch.branchId = :branchId " +
           "AND r.status = :status AND r.startTime BETWEEN :startDate AND :endDate")
    long countByBranchAndStatusAndDateRange(@Param("branchId") UUID branchId, @Param("status") ReservationStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

}