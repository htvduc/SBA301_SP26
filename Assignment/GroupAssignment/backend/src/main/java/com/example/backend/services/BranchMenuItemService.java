package com.example.backend.services;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.GuestBranchMenuItemDTO;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMenuItemMapper;
import com.example.backend.repositories.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BranchMenuItemService {

    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final BranchRepository branchRepository;
    private final MediaService mediaService;
    private final BranchMenuItemMapper branchMenuItemMapper;
    private final OrderItemRepository orderItemRepository;
    private final PromotionService promotionService;

    public BranchMenuItemService(
            BranchMenuItemRepository branchMenuItemRepository,
            MenuItemRepository menuItemRepository,
            BranchRepository branchRepository,
            MediaService mediaService,
            BranchMenuItemMapper branchMenuItemMapper,
            OrderItemRepository orderItemRepository,
            PromotionService promotionService
    ) {
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.branchRepository = branchRepository;
        this.mediaService = mediaService;
        this.branchMenuItemMapper = branchMenuItemMapper;
        this.orderItemRepository = orderItemRepository;
        this.promotionService = promotionService;
    }

    public List<BranchMenuItemDTO> getMenuItemsByBranch(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);

        UUID restaurantId = branchMenuItems.isEmpty()
                ? branchMenuItemRepository.findRestaurantIdByBranchId(branchId)
                : branchMenuItems.getFirst().getBranch().getRestaurant().getRestaurantId();

        List<MenuItem> activeItems = menuItemRepository.findAllByRestaurant_RestaurantIdAndStatus(restaurantId, EntityStatus.ACTIVE);

        List<UUID> itemIds = activeItems.stream().map(MenuItem::getMenuItemId).toList();
        Map<UUID, String> imageMap = mediaService.getLatestImageUrlsForTargets(itemIds, "MENU_ITEM_IMAGE");

        Map<UUID, BranchMenuItem> branchMenuItemMap = branchMenuItems.stream()
                .collect(Collectors.toMap(b -> b.getMenuItem().getMenuItemId(), b -> b));

        return activeItems.stream().map(menuItem -> {
            BranchMenuItem mapping = branchMenuItemMap.get(menuItem.getMenuItemId());
            BranchMenuItemDTO dto = new BranchMenuItemDTO();

            dto.setMenuItemId(menuItem.getMenuItemId());
            dto.setName(menuItem.getName());
            dto.setDescription(menuItem.getDescription());
            dto.setPrice(menuItem.getPrice());

            BigDecimal discountedPrice = promotionService.calculateItemDiscountedPriceByRestaurant(restaurantId, menuItem);
            dto.setDiscountedPrice(discountedPrice);

            dto.setStatus(menuItem.getStatus());
            dto.setBestSeller(menuItem.isBestSeller());
            dto.setHasCustomization(menuItem.isHasCustomization());
            dto.setRestaurantId(menuItem.getRestaurant().getRestaurantId());
            dto.setCategoryId(menuItem.getCategory().getCategoryId());
            dto.setCategoryName(menuItem.getCategory().getName());
            dto.setImageUrl(imageMap.get(menuItem.getMenuItemId()));

            List<BranchMenuItemDTO.CustomizationInfo> customizationInfos = new ArrayList<>();
            if (menuItem.getCustomizations() != null) {
                for (Customization c : menuItem.getCustomizations()) {
                    if (c.getStatus() == EntityStatus.ACTIVE) {
                        customizationInfos.add(new BranchMenuItemDTO.CustomizationInfo(
                                c.getCustomizationId().toString(),
                                c.getName(),
                                c.getPrice(),
                                c.getCustomizationType()
                        ));
                    }
                }
            }
            dto.setCustomizations(customizationInfos);

            if (mapping != null) {
                dto.setAvailable(mapping.isAvailable());
                dto.setBranchMenuItemId(mapping.getBranchMenuItemId());
            } else {
                dto.setAvailable(false);
            }

            dto.setBranchId(branchId);
            return dto;
        }).toList();
    }

    public void updateAvailabilityByBranchAndMenuItem(UUID branchId, UUID menuItemId, boolean available) {
        // Check if trying to mark as unavailable
        if (!available) {
            // Check if menu item is in any active orders
            boolean isInActiveOrder = orderItemRepository.existsActiveOrderItemByMenuItemId(
                menuItemId,
                EntityStatus.ACTIVE,
                Arrays.asList(OrderLineStatus.PENDING, OrderLineStatus.PREPARING),
                OrderStatus.EATING
            );
            
            if (isInActiveOrder) {
                throw new AppException(ErrorCode.MENUITEM_IN_ACTIVE_ORDER);
            }
        }
        
        BranchMenuItem entity = branchMenuItemRepository
                .findByBranch_BranchIdAndMenuItem_MenuItemId(branchId, menuItemId)
                .orElseGet(() -> {
                    BranchMenuItem newEntity = new BranchMenuItem();
                    newEntity.setBranch(branchRepository.findById(branchId)
                            .orElseThrow(() -> new RuntimeException("Branch not found")));
                    newEntity.setMenuItem(menuItemRepository.findById(menuItemId)
                            .orElseThrow(() -> new RuntimeException("Menu item not found")));
                    return newEntity;
                });

        entity.setAvailable(available);
        branchMenuItemRepository.save(entity);
    }

    public List<GuestBranchMenuItemDTO> getListBranchMenuItems(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);
        if (branchMenuItems.isEmpty()) {
            throw new AppException(ErrorCode.BRANCH_NOTEXISTED);
        }
        List<GuestBranchMenuItemDTO> guestBranchMenuItemDTOs = branchMenuItems.stream().map(branchMenuItem -> branchMenuItemMapper.toGuestBranchMenuItemDTO(branchMenuItem)).toList();
        // Image handling
        Map<UUID, String> imageMap = mediaService.getLatestImageUrlsForTargets(guestBranchMenuItemDTOs.stream().map(branchMenuItem -> branchMenuItem.getMenuItemId()).toList(), "MENU_ITEM_IMAGE"); 
        for (GuestBranchMenuItemDTO guestBranchMenuItemDTO : guestBranchMenuItemDTOs) {
            guestBranchMenuItemDTO.setImageUrl(imageMap.get(guestBranchMenuItemDTO.getMenuItemId()));
            MenuItem menuItem = menuItemRepository.findById(guestBranchMenuItemDTO.getMenuItemId())
                    .orElse(null);
            if (menuItem != null) {
                UUID restaurantId = menuItem.getRestaurant().getRestaurantId();
                guestBranchMenuItemDTO.setDiscountedPrice(
                        promotionService.calculateItemDiscountedPriceByRestaurant(restaurantId, menuItem));
            } else {
                guestBranchMenuItemDTO.setDiscountedPrice(guestBranchMenuItemDTO.getPrice());
            }
        }
        return guestBranchMenuItemDTOs;
    }

}