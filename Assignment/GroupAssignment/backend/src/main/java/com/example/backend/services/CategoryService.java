package com.example.backend.services;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.dto.request.CategoryCreateRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.CustomizationRepository;
import com.example.backend.repositories.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final RestaurantRepository restaurantRepository;
    private final CustomizationRepository customizationRepository;
    private final OwnershipValidationService ownershipValidationService;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper,
                           RestaurantRepository restaurantRepository, CustomizationRepository customizationRepository,
                           OwnershipValidationService ownershipValidationService) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.restaurantRepository = restaurantRepository;
        this.customizationRepository = customizationRepository;
        this.ownershipValidationService = ownershipValidationService;
    }

    public List<CategoryDTO> getAllByRestaurant(UUID restaurantId) {
        // Check ownership before allowing access
        ownershipValidationService.validateRestaurantOwnership(restaurantId);
        
        List<Category> categories = categoryRepository
                .findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE);

        return categories.stream()
                .map(categoryMapper::toCategoryDTO)
                .toList();
    }

    // Public version without ownership validation for customer access
    public List<CategoryDTO> getByRestaurant(UUID restaurantId) {
        List<Category> categories = categoryRepository
                .findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE);

        return categories.stream()
                .map(categoryMapper::toCategoryDTO)
                .toList();
    }

    public CategoryDTO getById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        
        // Check ownership before allowing access
        ownershipValidationService.validateRestaurantOwnership(category.getRestaurant());
        
        return categoryMapper.toCategoryDTO(category);
    }

    @Transactional
    public CategoryDTO create(CategoryCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check ownership before allowing creation
        ownershipValidationService.validateRestaurantOwnership(restaurant);

        Category category = new Category();
        category.setName(request.getName());
        category.setRestaurant(restaurant);
        category.setStatus(EntityStatus.ACTIVE);
        category.setCreatedAt(Instant.now());

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .filter(id -> id != null)
                    .map(id -> customizationRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            category.setCustomizations(customizations);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toCategoryDTO(saved);
    }

    @Transactional
    public CategoryDTO update(UUID id, CategoryDTO dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Check ownership before allowing update
        ownershipValidationService.validateRestaurantOwnership(existing.getRestaurant());

        existing.setName(dto.getName());
        existing.setUpdatedAt(Instant.now());

        // Clear existing customizations first
        existing.getCustomizations().clear();

        if (dto.getCustomizationIds() != null && !dto.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = dto.getCustomizationIds().stream()
                    .filter(cid -> cid != null)
                    .map(cid -> customizationRepository.findById(cid)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());

            existing.getCustomizations().addAll(customizations);
        }

        Category saved = categoryRepository.save(existing);
        return categoryMapper.toCategoryDTO(saved);
    }

    @Transactional
    public void delete(UUID id) {
        categoryRepository.findById(id).ifPresent(category -> {
            // Check ownership before allowing delete
            ownershipValidationService.validateRestaurantOwnership(category.getRestaurant());
            
            category.setStatus(EntityStatus.DELETED);
            categoryRepository.save(category);
        });
    }
}
