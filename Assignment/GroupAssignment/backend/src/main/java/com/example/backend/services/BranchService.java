package com.example.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.User;
import com.example.backend.entities.FeatureCode;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMapper;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.StaffAccountRepository;

@Service
public class BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;
    private final RestaurantRepository restaurantRepository;
    private final StaffAccountRepository staffAccountRepository;
    private final FeatureLimitCheckerService featureLimitCheckerService;
    private final OwnershipValidationService ownershipValidationService;
    // private final BranchMenuItemRepository branchMenuItemRepository;
    // private final MenuItemRepository menuItemRepository;

    public BranchService(
            BranchRepository branchRepository,
            BranchMapper branchMapper,
            RestaurantRepository restaurantRepository,
            StaffAccountRepository staffAccountRepository,
            FeatureLimitCheckerService featureLimitCheckerService,
            OwnershipValidationService ownershipValidationService
            // BranchMenuItemRepository branchMenuItemRepository,
            // MenuItemRepository menuItemRepository
    ) {
        this.branchRepository = branchRepository;
        this.branchMapper = branchMapper;
        this.restaurantRepository = restaurantRepository;
        this.staffAccountRepository = staffAccountRepository;
        this.featureLimitCheckerService = featureLimitCheckerService;
        this.ownershipValidationService = ownershipValidationService;
        // this.branchMenuItemRepository = branchMenuItemRepository;
        // this.menuItemRepository = menuItemRepository;
    }

    private BranchDTO toDtoWithStaffCount(Branch branch) {
        BranchDTO dto = branchMapper.toDto(branch);
        long count = staffAccountRepository.countByBranch(branch);
        dto.setStaffCount(count);
        return dto;
    }

    private User getCurrentUser() {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private void checkRestaurantOwnership(UUID restaurantId) {
        // Use OwnershipValidationService for consistent ownership validation
        ownershipValidationService.validateRestaurantOwnership(restaurantId);
    }

    public List<BranchDTO> getAll() {
        return branchRepository.findAll().stream().map(this::toDtoWithStaffCount).toList();
    }

    public BranchDTO getById(UUID id) {
        Branch b = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        
        return toDtoWithStaffCount(b);
    }

    @Transactional
    public BranchDTO create(BranchDTO dto) {
        // Validate required fields
        if (dto.getOpeningTime() == null || dto.getClosingTime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check ownership
        checkRestaurantOwnership(dto.getRestaurantId());

        // Check branch creation limit before creating
        featureLimitCheckerService.checkLimit(
                dto.getRestaurantId(),
                FeatureCode.LIMIT_BRANCH_CREATION,
                () -> branchRepository.countByRestaurant_RestaurantIdAndIsActiveTrue(dto.getRestaurantId())
        );

        Branch entity = branchMapper.toEntity(dto);
        entity.setRestaurant(restaurant);
        entity.setActive(true);

        Branch saved = branchRepository.save(entity);
        
        // Automatically create BranchMenuItem records for all active menu items
        // List<MenuItem> activeMenuItems = 
        //     menuItemRepository.findAllByRestaurant_RestaurantIdAndStatus(
        //         restaurant.getRestaurantId(), 
        //         MenuItemStatus.ACTIVE
        //     );
        
        // for (MenuItem menuItem : activeMenuItems) {
        //     BranchMenuItem branchMenuItem = new BranchMenuItem();
        //     branchMenuItem.setBranch(saved);
        //     branchMenuItem.setMenuItem(menuItem);
        //     branchMenuItem.setAvailable(true); // Set as available by default
        //     branchMenuItemRepository.save(branchMenuItem);
        // }
        
        return toDtoWithStaffCount(saved);
    }

    @Transactional
    public BranchDTO update(UUID id, BranchDTO dto) {
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Check ownership
        checkRestaurantOwnership(exist.getRestaurant().getRestaurantId());

        // Only validate opening/closing time if they are being updated
        // This allows partial updates (e.g., just updating isActive status)
        if (dto.getOpeningTime() != null && dto.getClosingTime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (dto.getOpeningTime() == null && dto.getClosingTime() != null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        branchMapper.updateEntityFromDto(dto, exist);
        Branch saved = branchRepository.save(exist);
        return toDtoWithStaffCount(saved);
    }

    @Transactional
    public BranchDTO updateContactInfo(UUID id, BranchDTO dto) {
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Permission check: Owner of the restaurant or Branch Manager of this branch
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication();
        Object principal = authentication != null ? authentication.getPrincipal() : null;

        boolean isAuthorized = false;

        if (principal instanceof User user) {
            if (exist.getRestaurant().getUser().getUserId().equals(user.getUserId())) {
                isAuthorized = true;
            }
        } else if (principal instanceof StaffAccount staff) {
            if (staff.getBranch().getBranchId().equals(id) &&
                    staff.getRole().getName() == RoleName.BRANCH_MANAGER) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (dto.getBranchPhone() != null) {
            exist.setBranchPhone(dto.getBranchPhone());
        }
        if (dto.getMail() != null) {
            exist.setMail(dto.getMail());
        }

        Branch saved = branchRepository.save(exist);
        return toDtoWithStaffCount(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        exist.setActive(false);
        branchRepository.save(exist);
    }

    public List<BranchDTO> getByRestaurant(UUID restaurantId) {
        // Check ownership
        checkRestaurantOwnership(restaurantId);
        
        return branchRepository.findByRestaurant_RestaurantId(restaurantId)
                .stream().map(this::toDtoWithStaffCount).toList();
    }
    public List<BranchDTO> getByPublicRestaurant(UUID restaurantId) {

        return branchRepository.findByRestaurant_RestaurantId(restaurantId)
                .stream().map(this::toDtoWithStaffCount).toList();
    }

    public List<BranchDTO> getActiveByRestaurant(UUID restaurantId) {
        // Check ownership
        checkRestaurantOwnership(restaurantId);
        
        return branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId)
                .stream().map(this::toDtoWithStaffCount).toList();
    }

    @Transactional(readOnly = true)
    public UUID getRestaurantIdByBranchId(UUID branchId) {
        return branchRepository.findRestaurantIdByBranchId(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
    }
    @Transactional(readOnly = true)
    public String getRestaurantSlugByBranchId(UUID branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        return branch.getRestaurant().getPublicUrl();
    }

    @Transactional(readOnly = true)
    public boolean canCreateBranch(UUID restaurantId) {
        return featureLimitCheckerService.isUnderLimit(
                restaurantId,
                FeatureCode.LIMIT_BRANCH_CREATION,
                () -> branchRepository.countByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId)
        );
    }

    @Transactional(readOnly = true)
    public List<BranchDTO> getBranchesByOwner(UUID ownerId) {
        User currentUser = getCurrentUser();
        
        // Check if current user is requesting their own branches
        if (!currentUser.getUserId().equals(ownerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        return branchRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::toDtoWithStaffCount)
                .toList();
    }
}