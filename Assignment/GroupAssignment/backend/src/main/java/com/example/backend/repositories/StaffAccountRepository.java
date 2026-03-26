package com.example.backend.repositories;


import java.util.Optional;
import java.util.UUID;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.RoleName;



@Repository
public interface StaffAccountRepository extends JpaRepository<StaffAccount, UUID> {

    @Query("""
           SELECT s
           FROM StaffAccount s
           JOIN FETCH s.role
           JOIN FETCH s.branch b
           JOIN FETCH b.restaurant
           WHERE s.username = :username
           AND b.restaurant.restaurantId = :restaurantId
           """)
    Optional<StaffAccount> findByUsernameAndBranch_Restaurant_RestaurantId(
        @Param("username") String username, 
        @Param("restaurantId") UUID restaurantId
    );

    boolean existsByUsernameAndBranch_Restaurant_RestaurantId(String username, UUID restaurantId);
    
    // Find staff with role eagerly loaded to avoid LazyInitializationException
    @Query("SELECT s FROM StaffAccount s JOIN FETCH s.role WHERE s.staffAccountId = :staffId")
    Optional<StaffAccount> findByIdWithRole(@Param("staffId") UUID staffId);

    @Query("""
           SELECT s
           FROM StaffAccount s
           JOIN FETCH s.role
           JOIN FETCH s.branch b
           JOIN FETCH b.restaurant
           WHERE s.staffAccountId = :staffId
           """)
    Optional<StaffAccount> findByIdWithRoleBranchAndRestaurant(@Param("staffId") UUID staffId);
    
    // Lấy nhân viên theo chi nhánh, loại bỏ vai trò Manager (cho Branch Manager)
    @Query("SELECT s FROM StaffAccount s WHERE s.branch = :branch AND s.role.name != :excludeRole " +
           "AND LOWER(s.username) LIKE :keyword " +
           "AND (:roleFilter IS NULL OR s.role.name = :roleFilter) " +
           "AND (:isActive IS NULL OR (s.status = 'ACTIVE' AND :isActive = true) OR (s.status = 'INACTIVE' AND :isActive = false))")
    Page<StaffAccount> findByBranchAndFiltersForManager(
        @Param("branch") Branch branch, 
        @Param("excludeRole") RoleName excludeRole,
        @Param("keyword") String keyword,
        @Param("roleFilter") RoleName roleFilter,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );

    // Lấy nhân viên theo chi nhánh (bao gồm tất cả Role)
    @Query("SELECT s FROM StaffAccount s WHERE s.branch = :branch " +
           "AND LOWER(s.username) LIKE :keyword " +
           "AND (:roleFilter IS NULL OR s.role.name = :roleFilter) " +
           "AND (:isActive IS NULL OR (s.status = 'ACTIVE' AND :isActive = true) OR (s.status = 'INACTIVE' AND :isActive = false))")
    Page<StaffAccount> findByBranchAndFiltersForOwner(
        @Param("branch") Branch branch, 
        @Param("keyword") String keyword,
        @Param("roleFilter") RoleName roleFilter,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );

    // Lấy nhân viên theo toàn bộ nhà hàng (cho Restaurant Owner)
    Page<StaffAccount> findByBranch_Restaurant_RestaurantId(UUID restaurantId, Pageable pageable);

    // Đếm số lượng nhân viên theo vai trò trong chi nhánh (cho Thống kê)
    long countByBranchAndRole_Name(Branch branch, RoleName roleName);

    // Đếm tất cả nhân viên trong chi nhánh (cập nhật mới)
    long countByBranch(Branch branch);

    // Đếm số lượng nhân viên trong chi nhánh, loại bỏ một vai trò cụ thể (ví dụ BRANCH_MANAGER)
    long countByBranchAndRole_NameNot(Branch branch, RoleName roleName);
}