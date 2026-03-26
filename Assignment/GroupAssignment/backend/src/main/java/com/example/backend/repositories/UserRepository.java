package com.example.backend.repositories;

import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.userId = :userId")
    Optional<User> findByIdWithRole(@Param("userId") UUID userId);
    
    Page<User> findByRole_NameNot(RoleName roleName, Pageable pageable);
    
    @Query("SELECT u FROM User u JOIN FETCH u.role LEFT JOIN FETCH u.restaurants r " +
           "WHERE u.role.name = :roleName " +
           "AND (:search IS NULL OR :search = '' OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findRestaurantOwnersWithRestaurants(@Param("roleName") RoleName roleName, 
                                                   @Param("search") String search, 
                                                   Pageable pageable);
}
