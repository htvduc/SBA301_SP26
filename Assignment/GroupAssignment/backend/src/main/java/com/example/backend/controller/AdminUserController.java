package com.example.backend.controller;

import com.example.backend.dto.AdminUserDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.services.AdminUserService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/restaurant-owners")
    public ApiResponse<PageResponse<AdminUserDTO>> getRestaurantOwners(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<AdminUserDTO> users = adminUserService.getRestaurantOwners(search, page, size);
        
        PageResponse<AdminUserDTO> pageResponse = new PageResponse<>();
        pageResponse.setContent(users.getContent());
        pageResponse.setPage(users.getNumber());
        pageResponse.setSize(users.getSize());
        pageResponse.setTotalElements(users.getTotalElements());
        pageResponse.setTotalPages(users.getTotalPages());
        pageResponse.setFirst(users.isFirst());
        pageResponse.setLast(users.isLast());
        
        ApiResponse<PageResponse<AdminUserDTO>> response = new ApiResponse<>();
        response.setResult(pageResponse);
        response.setMessage("Restaurant owners retrieved successfully");
        
        return response;
    }

    @GetMapping("/{userId}")
    public ApiResponse<AdminUserDTO> getUserDetails(@PathVariable String userId) {
        ApiResponse<AdminUserDTO> response = new ApiResponse<>();
        response.setResult(adminUserService.getUserDetails(userId));
        response.setMessage("User details retrieved successfully");
        return response;
    }
}