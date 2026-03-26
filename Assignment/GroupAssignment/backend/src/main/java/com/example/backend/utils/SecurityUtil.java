package com.example.backend.utils;

import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SecurityUtil {

    private final UserRepository userRepository;

    public SecurityUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<Authentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    /**
     * Get current user ID from authentication principal.
     * Works with both JWT authentication (UsernamePasswordAuthenticationToken with User principal)
     * and OAuth2 authentication.
     */
    public Optional<UUID> getCurrentUserId() {
        return getCurrentAuthentication()
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .map(principal -> {
                    // If principal is User entity (from JwtAuthenticationFilter)
                    if (principal instanceof User) {
                        return ((User) principal).getUserId();
                    }
                    // If principal is String (userId as string)
                    if (principal instanceof String) {
                        try {
                            return UUID.fromString((String) principal);
                        } catch (IllegalArgumentException e) {
                            return null;
                        }
                    }
                    return null;
                });
    }

    public Optional<User> getOptionalCurrentUser() {
        return getCurrentAuthentication()
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getPrincipal)
                .flatMap(principal -> {
                    // If principal is already User entity (from JwtAuthenticationFilter)
                    if (principal instanceof User) {
                        return Optional.of((User) principal);
                    }
                    // Otherwise, try to get userId and fetch from database
                    return getCurrentUserId().flatMap(userRepository::findById);
                });
    }

    public User getCurrentUser() {
        return getOptionalCurrentUser()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    public boolean isAuthenticated() {
        return getCurrentAuthentication()
                .map(Authentication::isAuthenticated)
                .orElse(false);
    }
}