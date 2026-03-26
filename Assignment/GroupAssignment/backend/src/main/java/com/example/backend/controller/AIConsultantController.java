package com.example.backend.controller;

import com.example.backend.dto.request.AIConsultantRequest;
import com.example.backend.dto.response.AIConsultantResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entities.Branch;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.StaffAccountRepository;
import com.example.backend.services.AIConsultantService;
import com.example.backend.services.OwnershipValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.backend.entities.RoleName;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AIConsultantController {

    private final AIConsultantService aiConsultantService;
    private final OwnershipValidationService ownershipValidationService;
    private final BranchRepository branchRepository;
    private final StaffAccountRepository staffAccountRepository;

    @PostMapping("/restaurants/{restaurantId}/ai-consultant")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ApiResponse<AIConsultantResponse> consultRestaurant(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody AIConsultantRequest request) {
        
        log.info("AI consultation request for restaurant: {}", restaurantId);
        
        ownershipValidationService.validateRestaurantOwnership(restaurantId);
        
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }
        
        AIConsultantResponse result = aiConsultantService.consultRestaurant(
                restaurantId,
                request.getQuestion(),
                sessionId,
                request.getTimeframe(),
                request.getSpecificDate()
        );
        
        ApiResponse<AIConsultantResponse> response = new ApiResponse<>();
        response.setResult(result);
        response.setMessage("AI consultation completed successfully");
        
        return response;
    }

    @PostMapping("/branches/{branchId}/ai-consultant")
    @PreAuthorize("hasAnyRole('RESTAURANT_OWNER', 'BRANCH_MANAGER')")
    public ApiResponse<AIConsultantResponse> consultBranch(
            @PathVariable UUID branchId,
            @Valid @RequestBody AIConsultantRequest request) {
        
        log.info("AI consultation request for branch: {}", branchId);
        
        validateBranchAccess(branchId);
        
        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }
        
        AIConsultantResponse result = aiConsultantService.consultBranch(
                branchId,
                request.getQuestion(),
                sessionId,
                request.getTimeframe(),
                request.getSpecificDate()
        );
        
        ApiResponse<AIConsultantResponse> response = new ApiResponse<>();
        response.setResult(result);
        response.setMessage("AI consultation completed successfully");
        
        return response;
    }

    private void validateBranchAccess(UUID branchId) {
        Object principal = getCurrentPrincipal();
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        if (principal instanceof User) {
            User user = (User) principal;
            if (!branch.getRestaurant().getUser().getUserId().equals(user.getUserId())) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else if (principal instanceof StaffAccount) {
            StaffAccount staff = (StaffAccount) principal;
            StaffAccount staffWithRole = staffAccountRepository.findByIdWithRole(staff.getStaffAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
            
            boolean isBranchManager = staffWithRole.getRole().getName().equals(RoleName.BRANCH_MANAGER);
            boolean isAssignedToBranch = staff.getBranch().getBranchId().equals(branchId);
            
            if (!isBranchManager || !isAssignedToBranch) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    private Object getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return authentication.getPrincipal();
    }
}
