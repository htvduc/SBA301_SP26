package com.example.backend.services;

import com.example.backend.dto.MenuItemDTO;
import java.math.BigDecimal;
import com.example.backend.dto.PromotionDTO;
import com.example.backend.dto.request.CreatePromotionRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.MenuItemRepository;
import com.example.backend.repositories.PromotionRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.mapper.PromotionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final PromotionMapper promotionMapper;

    public PromotionService(PromotionRepository promotionRepository,
                            RestaurantRepository restaurantRepository,
                            MenuItemRepository menuItemRepository,
                            PromotionMapper promotionMapper) {
        this.promotionRepository = promotionRepository;
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.promotionMapper = promotionMapper;
    }

    @Transactional
    public PromotionDTO createPromotion(UUID restaurantId, CreatePromotionRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Promotion promotion = new Promotion();
        promotion.setRestaurant(restaurant);
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setCode(request.getCode());
        promotion.setPromotionType(request.getPromotionType());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(request.getMinOrderValue());
        promotion.setMaxDiscountValue(request.getMaxDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setStatus(PromotionStatus.ACTIVE);
        
        if (request.getMenuItemIds() != null && !request.getMenuItemIds().isEmpty()) {
            validatePromotionOverlap(restaurantId, request.getMenuItemIds(), request.getStartDate(), request.getEndDate(), null);
            List<MenuItem> items = menuItemRepository.findAllById(request.getMenuItemIds());
            promotion.setMenuItems(new HashSet<>(items));
        }

        return promotionMapper.toPromotionDTO(promotionRepository.save(promotion));
    }

    public List<PromotionDTO> getPromotions(UUID restaurantId) {
        return promotionRepository.findAllByRestaurant_RestaurantIdAndStatusNot(restaurantId, PromotionStatus.DELETED)
                .stream()
                .map(promotionMapper::toPromotionDTO)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getActivePromotions(UUID restaurantId) {
        return promotionRepository.findAllByRestaurant_RestaurantIdAndStatus(restaurantId, PromotionStatus.ACTIVE)
                .stream()
                .map(promotionMapper::toPromotionDTO)
                .collect(Collectors.toList());
    }

    public PromotionDTO getPromotionById(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return promotionMapper.toPromotionDTO(promotion);
    }

    @Transactional
    public void deletePromotion(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.setStatus(PromotionStatus.DELETED);
        promotionRepository.save(promotion);
    }

    @Transactional
    public PromotionDTO updatePromotion(UUID promotionId, CreatePromotionRequest request) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setCode(request.getCode());
        promotion.setPromotionType(request.getPromotionType());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(request.getMinOrderValue());
        promotion.setMaxDiscountValue(request.getMaxDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());

        if (request.getMenuItemIds() != null && !request.getMenuItemIds().isEmpty()) {
            validatePromotionOverlap(promotion.getRestaurant().getRestaurantId(), request.getMenuItemIds(), request.getStartDate(), request.getEndDate(), promotionId);
            List<MenuItem> items = menuItemRepository.findAllById(request.getMenuItemIds());
            promotion.setMenuItems(new HashSet<>(items));
        } else {
            promotion.getMenuItems().clear();
        }

        return promotionMapper.toPromotionDTO(promotionRepository.save(promotion));
    }

    private void validatePromotionOverlap(UUID restaurantId, java.util.Set<UUID> menuItemIds, Instant startDate, Instant endDate, UUID excludePromotionId) {
        if (menuItemIds == null || menuItemIds.isEmpty()) return;
        
        List<Promotion> overlappingPromotions = promotionRepository.findOverlappingPromotions(
                restaurantId, menuItemIds, startDate, endDate, excludePromotionId);
        
        if (!overlappingPromotions.isEmpty()) {
            throw new AppException(ErrorCode.PROMOTION_OVERLAP);
        }
    }

    @Transactional
    public PromotionDTO updatePromotionStatus(UUID promotionId, PromotionStatus status) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.setStatus(status);
        return promotionMapper.toPromotionDTO(promotionRepository.save(promotion));
    }

    public BigDecimal calculateItemDiscountedPrice(MenuItem menuItem) {
        BigDecimal originalPrice = menuItem.getPrice();
        Optional<Promotion> activePromotion = promotionRepository.findActivePromotionForMenuItem(
                menuItem.getMenuItemId(), Instant.now());

        if (activePromotion.isEmpty()) {
            return originalPrice;
        }

        Promotion promotion = activePromotion.get();
        BigDecimal discountedPrice;

        if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discountAmount = originalPrice.multiply(promotion.getDiscountValue())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
            discountedPrice = originalPrice.subtract(discountAmount);
        } else {
            discountedPrice = originalPrice.subtract(promotion.getDiscountValue());
        }

        return discountedPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : discountedPrice;
    }

    public BigDecimal calculateItemDiscountedPriceByRestaurant(UUID restaurantId, MenuItem menuItem) {
        BigDecimal maxDiscountAmount = BigDecimal.ZERO;
        List<Promotion> activeItemPromotions = promotionRepository
                .findAllByRestaurant_RestaurantIdAndPromotionTypeAndStatus(
                        restaurantId, PromotionType.MENU_ITEM, PromotionStatus.ACTIVE);

        Instant now = Instant.now();
        for (Promotion promotion : activeItemPromotions) {
            if (promotion.getStartDate().isAfter(now) || promotion.getEndDate().isBefore(now)) {
                continue;
            }
            if (!promotion.getMenuItems().contains(menuItem)) {
                continue;
            }
            BigDecimal currentDiscount = computeDiscountAmount(menuItem.getPrice(), promotion);
            if (currentDiscount.compareTo(maxDiscountAmount) > 0) {
                maxDiscountAmount = currentDiscount;
            }
        }
        BigDecimal discountedPrice = menuItem.getPrice().subtract(maxDiscountAmount);
        return discountedPrice.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : discountedPrice;
    }

    public BigDecimal computeDiscountAmount(BigDecimal baseAmount, Promotion promotion) {
        BigDecimal discountAmount;
        if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = baseAmount.multiply(promotion.getDiscountValue())
                    .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
        } else {
            discountAmount = promotion.getDiscountValue();
        }

        if (promotion.getMaxDiscountValue() != null
                && promotion.getMaxDiscountValue().compareTo(BigDecimal.ZERO) > 0
                && discountAmount.compareTo(promotion.getMaxDiscountValue()) > 0) {
            discountAmount = promotion.getMaxDiscountValue();
        }
        return discountAmount.max(BigDecimal.ZERO);
    }
}
