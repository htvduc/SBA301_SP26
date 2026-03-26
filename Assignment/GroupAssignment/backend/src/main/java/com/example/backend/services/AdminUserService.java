package com.example.backend.services;

import com.example.backend.dto.AdminUserDTO;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<AdminUserDTO> getRestaurantOwners(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findRestaurantOwnersWithRestaurants(
            RoleName.RESTAURANT_OWNER, search, pageable);
        
        return users.map(this::convertToAdminUserDTO);
    }

    public AdminUserDTO getUserDetails(String userId) {
        User user = userRepository.findById(java.util.UUID.fromString(userId))
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only allow viewing restaurant owners
        if (!user.getRole().getName().equals(RoleName.RESTAURANT_OWNER)) {
            throw new RuntimeException("Access denied: Can only view restaurant owners");
        }
        
        return convertToAdminUserDTO(user);
    }

    private AdminUserDTO convertToAdminUserDTO(User user) {
        List<AdminUserDTO.RestaurantSummaryDTO> restaurants = user.getRestaurants().stream()
            .map(restaurant -> new AdminUserDTO.RestaurantSummaryDTO(
                restaurant.getRestaurantId(),
                restaurant.getName(),
                restaurant.isStatus(),
                restaurant.getCreatedAt()
            ))
            .collect(Collectors.toList());

        return new AdminUserDTO(
            user.getUserId(),
            user.getEmail(),
            user.getUsername(),
            user.getRole().getName().toString(),
            user.getStatus().toString(),
            user.getCreatedAt(),
            restaurants
        );
    }
}