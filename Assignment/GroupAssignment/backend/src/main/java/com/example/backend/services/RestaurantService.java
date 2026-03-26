package com.example.backend.services;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RestaurantMapper;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repositories.BranchRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final OwnershipValidationService ownershipValidationService;

    public RestaurantService(
            RestaurantRepository restaurantRepository,
            RestaurantMapper restaurantMapper,
            UserRepository userRepository,
            // SubscriptionRepository subscriptionRepository,
            BranchRepository branchRepository,
            OwnershipValidationService ownershipValidationService) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantMapper = restaurantMapper;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.ownershipValidationService = ownershipValidationService;
    }

    public List<RestaurantDTO> getAll() {
        return restaurantRepository.findAll().stream()
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }

    public RestaurantDTO getById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check ownership - only owner can access their restaurant details
        ownershipValidationService.validateRestaurantOwnership(restaurant);

        return restaurantMapper.toRestaurantDto(restaurant);
    }

    @Transactional
    public void delete(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check ownership before allowing delete
        ownershipValidationService.validateRestaurantOwnership(restaurant);

        try {
            branchRepository.deactivateAllByRestaurantId(id);

            restaurant.setStatus(false);
            restaurant.setUpdatedAt(Instant.now());
            restaurantRepository.save(restaurant);

        } catch (Exception e) {
            throw new AppException(ErrorCode.RESTAURANT_DELETE_FAILED);
        }
    }

    public List<RestaurantDTO> getByOwner(UUID userId) {
        return restaurantRepository.findByUser_UserId(userId).stream()
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }

    public void validateOwnership(UUID restaurantId) {
        ownershipValidationService.validateRestaurantOwnership(restaurantId);
    }

    public boolean isOwner(UUID restaurantId) {
        return ownershipValidationService.isRestaurantOwner(restaurantId);
    }

    @Transactional
    public RestaurantDTO create(RestaurantCreateRequest request) {
        Restaurant restaurant = createEntity(request);
        return restaurantMapper.toRestaurantDto(restaurant);
    }

    @Transactional
    public Restaurant createEntity(RestaurantCreateRequest request) {
        var owner = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Restaurant restaurant = new Restaurant();
        restaurant.setUser(owner);
        restaurant.setName(request.getName());
        restaurant.setEmail(request.getEmail());
        restaurant.setRestaurantPhone(request.getRestaurantPhone());
        restaurant.setDescription(request.getDescription());
        restaurant.setStatus(false);

        // Tạo slug từ tên nhà hàng
        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        // Chỉ lưu slug, không lưu full URL
        restaurant.setPublicUrl(slug);

        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public RestaurantDTO update(UUID id, RestaurantDTO dto) {
        Restaurant exist = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        // Check ownership before allowing update
        ownershipValidationService.validateRestaurantOwnership(exist);

        if (dto.getName() != null) exist.setName(dto.getName());
        if (dto.getEmail() != null) exist.setEmail(dto.getEmail());
        if (dto.getRestaurantPhone() != null) exist.setRestaurantPhone(dto.getRestaurantPhone());
        if (dto.getDescription() != null) exist.setDescription(dto.getDescription());

        Restaurant saved = restaurantRepository.save(exist);
        return restaurantMapper.toRestaurantDto(saved);
    }
    public RestaurantDTO getBySlug(String slug) {
        return restaurantRepository.findByPublicUrl(slug)
                .map(restaurantMapper::toRestaurantDtoWithFullUrl)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
    }
}



