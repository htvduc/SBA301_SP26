package com.example.backend.services;

import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.request.CustomizationCreateRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.FeatureCode;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CustomizationMapper;
import com.example.backend.repositories.CustomizationRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.MenuItemRepository;
import com.example.backend.repositories.CategoryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class CustomizationService {

    private final CustomizationRepository customizationRepository;
    private final CustomizationMapper customizationMapper;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureLimitCheckerService featureLimitCheckerService;


    public CustomizationService(CustomizationRepository customizationRepository,
                                CustomizationMapper customizationMapper,
                                RestaurantRepository restaurantRepository,
                                MenuItemRepository menuItemRepository,
                                CategoryRepository categoryRepository,
                                FeatureLimitCheckerService featureLimitCheckerService) {
        this.customizationRepository = customizationRepository;
        this.customizationMapper = customizationMapper;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    public List<CustomizationDTO> getAllByRestaurant(UUID restaurantId) {
        List<Customization> list = customizationRepository
                .findAllByRestaurant_RestaurantIdAndStatus(restaurantId, EntityStatus.ACTIVE);

        return list.isEmpty()
                ? Collections.emptyList()
                : list.stream().map(customizationMapper::toCustomizationDTO).toList();
    }

    public CustomizationDTO getById(UUID id) {
        Customization customization = customizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));
        return customizationMapper.toCustomizationDTO(customization);
    }

    @Transactional
    public CustomizationDTO create(CustomizationCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check limit for customizations per category if categoryId is provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            
            featureLimitCheckerService.checkLimit(
                    request.getRestaurantId(),
                    FeatureCode.LIMIT_CUSTOMIZATION_PER_CATEGORY,
                    () -> customizationRepository.countByCategories_CategoryIdAndStatus(category.getCategoryId(), EntityStatus.ACTIVE)
            );
        }

        Customization customization = new Customization();
        customization.setName(request.getName());
        customization.setPrice(request.getPrice());
        customization.setRestaurant(restaurant);
        customization.setStatus(EntityStatus.ACTIVE);
        customization.setCustomizationType(request.getCustomizationType() != null 
            ? request.getCustomizationType() 
            : com.example.backend.entities.CustomizationType.ADDON);
        customization.setCreatedAt(Instant.now());

        if (request.getCategoryId() != null) {
            var category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            customization.getCategories().add(category);
        }

        if (request.getMenuItemId() != null) {
            var menuItem = menuItemRepository.findById(request.getMenuItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
            customization.getMenuItems().add(menuItem);
        }

        return customizationMapper.toCustomizationDTO(customizationRepository.save(customization));
    }

    @Transactional
    public CustomizationDTO update(UUID id, CustomizationDTO dto) {
        return customizationRepository.findById(id)
                .map(exist -> {
                    exist.setName(dto.getName());
                    exist.setPrice(dto.getPrice());
                    if (dto.getCustomizationType() != null) {
                        exist.setCustomizationType(dto.getCustomizationType());
                    }
                    exist.setUpdatedAt(Instant.now());
                    return customizationMapper.toCustomizationDTO(customizationRepository.save(exist));
                })
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));
    }

    @Transactional
    public void delete(UUID id) {
        customizationRepository.findById(id).ifPresent(customization -> {
            customization.setStatus(EntityStatus.DELETED);
            customizationRepository.save(customization);
        });
    }

    @Transactional
    public boolean canCreateCustomizationForCategory(UUID restaurantId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        return featureLimitCheckerService.isUnderLimit(
                restaurantId,
                FeatureCode.LIMIT_CUSTOMIZATION_PER_CATEGORY,
                () -> customizationRepository.countByCategories_CategoryIdAndStatus(category.getCategoryId(), EntityStatus.ACTIVE)
        );
    }

    public List<UUID> getCustomizationByCategoryId(UUID categoryId) {
        return customizationRepository.findAllByCategories_CategoryIdAndStatus(categoryId, EntityStatus.ACTIVE)
                                    .stream().map(Customization::getCustomizationId).toList();
    }

    // Public version for customer access - get customizations by menu item
    public List<CustomizationDTO> getByMenuItem(UUID menuItemId) {
        var menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
        
        Set<Customization> customizations = new LinkedHashSet<>();
        
        // Add customizations from the menu item's category (if hasCustomization = true)
        if (menuItem.isHasCustomization() && menuItem.getCategory() != null) {
            customizations.addAll(menuItem.getCategory().getCustomizations());
        }
        
        // Add specific customizations assigned directly to this menu item
        customizations.addAll(menuItem.getCustomizations());
        
        // Filter only ACTIVE customizations and return
        return customizations.stream()
                .filter(c -> c.getStatus() == EntityStatus.ACTIVE)
                .map(customizationMapper::toCustomizationDTO)
                .toList();
    }
}