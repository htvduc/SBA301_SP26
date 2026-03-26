package com.example.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.GoogleAccount;
import com.example.backend.entities.User;

@Repository
public interface GoogleAccountRepository extends JpaRepository<GoogleAccount, UUID> {
    
    /**
     * Find Google account by google_sub (unique Google subject identifier)
     * @param googleSub Unique Google subject identifier
     * @return Optional GoogleAccount
     */
    Optional<GoogleAccount> findByGoogleSub(String googleSub);
    
    /**
     * Find Google account by user
     * @param user User entity
     * @return Optional GoogleAccount
     */
    Optional<GoogleAccount> findByUser(User user);
    
    /**
     * Check if google_sub exists
     * @param googleSub Google subject identifier
     * @return true if exists
     */
    boolean existsByGoogleSub(String googleSub);
}
