package com.example.backend.services;

import com.example.backend.dto.*;
import com.example.backend.dto.request.ConfirmPaymentRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillService {

        private final BillRepository billRepository;
        private final OrderRepository orderRepository;
        private final BranchRepository branchRepository;
        private final AreaTableRepository areaTableRepository;
        private final OrderService orderService;
        private final PromotionRepository promotionRepository;
        private final PromotionUsageRepository promotionUsageRepository;
        private final PromotionService promotionService;

        public BillService(BillRepository billRepository,
                        OrderRepository orderRepository,
                        BranchRepository branchRepository,
                        AreaTableRepository areaTableRepository,
                        OrderService orderService,
                        PromotionRepository promotionRepository,
                        PromotionUsageRepository promotionUsageRepository,
                        PromotionService promotionService) {
                this.billRepository = billRepository;
                this.orderRepository = orderRepository;
                this.branchRepository = branchRepository;
                this.areaTableRepository = areaTableRepository;
                this.orderService = orderService;
                this.promotionRepository = promotionRepository;
                this.promotionUsageRepository = promotionUsageRepository;
                this.promotionService = promotionService;
        }

        @Transactional
        public BillDTO confirmPayment(ConfirmPaymentRequest request) {
                Order order = orderRepository.findById(request.getOrderId())
                                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

                if (order.getStatus() != OrderStatus.EATING) {
                        throw new AppException(ErrorCode.ORDER_ALREADY_COMPLETED);
                }

                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

                order.setStatus(OrderStatus.COMPLETED);
                orderRepository.save(order);

                AreaTable table = order.getAreaTable();
                table.setStatus(TableStatus.FREE);
                areaTableRepository.save(table);

                BigDecimal discountAmount = BigDecimal.ZERO;
                Promotion appliedPromotion = null;
                String promoCode = request.getPromotionCode() == null ? null : request.getPromotionCode().trim();
                if (promoCode != null && !promoCode.isEmpty()) {
                        Optional<Promotion> found = promotionRepository
                                        .findByRestaurant_RestaurantIdAndCodeIgnoreCaseAndStatus(
                                                        branch.getRestaurant().getRestaurantId(),
                                                        promoCode,
                                                        PromotionStatus.ACTIVE);
                        if (found.isEmpty()) {
                                throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
                        }
                        Promotion promotion = found.get();
                        Instant now = Instant.now();
                        if (promotion.getPromotionType() != PromotionType.ORDER
                                        || promotion.getStartDate().isAfter(now)
                                        || promotion.getEndDate().isBefore(now)) {
                                throw new AppException(ErrorCode.PROMOTION_EXPIRED);
                        }
                        if (promotion.getMinOrderValue() != null
                                        && order.getTotalPrice().compareTo(promotion.getMinOrderValue()) < 0) {
                                throw new AppException(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET);
                        }
                        discountAmount = promotionService.computeDiscountAmount(order.getTotalPrice(), promotion);
                        appliedPromotion = promotion;
                }

                BigDecimal finalPrice = order.getTotalPrice().subtract(discountAmount);
                if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                        finalPrice = BigDecimal.ZERO;
                }

                Bill bill = new Bill();
                bill.setOrder(order);
                bill.setBranch(branch);
                bill.setFinalPrice(finalPrice);
                bill.setDiscountAmount(discountAmount);
                bill.setPromotion(appliedPromotion);
                bill.setPaymentMethod(request.getPaymentMethod());
                bill.setNote(request.getNote());
                bill.setPaidTime(Instant.now());
                bill = billRepository.save(bill);

                if (appliedPromotion != null) {
                        PromotionUsage usage = new PromotionUsage();
                        usage.setPromotion(appliedPromotion);
                        usage.setOrder(order);
                        usage.setDiscountAmount(discountAmount);
                        promotionUsageRepository.save(usage);
                }

                return toBillDTO(bill, true);
        }

        /** Bill without nested full order (avoids duplicate heavy load when order is fetched separately). */
        public BillDTO getBillByOrderId(UUID orderId) {
                Bill bill = billRepository.findByOrder_OrderId(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
                return toBillDTO(bill, false);
        }

        public List<BillDTO> getBillsByBranch(UUID branchId) {
                return billRepository.findByBranch_BranchIdOrderByPaidTimeDesc(branchId).stream()
                                .map(b -> toBillDTO(b, true))
                                .collect(Collectors.toList());
        }

        public BillDTO getBillById(UUID billId) {
                Bill bill = billRepository.findById(billId)
                                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
                return toBillDTO(bill, true);
        }

        public List<BillDTO> getBillingHistory(UUID branchId, Instant startDate, Instant endDate) {
                return billRepository.findByBranchAndDateRange(branchId, startDate, endDate).stream()
                                .map(b -> toBillDTO(b, true))
                                .collect(Collectors.toList());
        }

        public Page<BillSummaryDTO> searchBills(UUID branchId, Instant startDate, Instant endDate,
                        PaymentMethod paymentMethod, String searchTerm, Pageable pageable) {
                String formattedSearchTerm = (searchTerm == null || searchTerm.isEmpty()) ? null
                                : "%" + searchTerm.toLowerCase() + "%";
                return billRepository
                                .searchBills(branchId, startDate, endDate, paymentMethod, formattedSearchTerm, pageable)
                                .map(this::toBillSummaryDTO);
        }

        private BillDTO toBillDTO(Bill bill, boolean includeFullOrder) {
                Branch branch = bill.getBranch();
                return BillDTO.builder()
                                .billId(bill.getBillId())
                                .orderId(bill.getOrder() != null ? bill.getOrder().getOrderId() : null)
                                .branchId(branch.getBranchId())
                                .tableName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getTag()
                                                : "N/A")
                                .areaName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getArea().getName()
                                                : "N/A")
                                .finalPrice(bill.getFinalPrice())
                                .discountAmount(bill.getDiscountAmount())
                                .promotionCode(bill.getPromotion() != null ? bill.getPromotion().getCode() : null)
                                .promotionName(bill.getPromotion() != null ? bill.getPromotion().getName() : null)
                                .note(bill.getNote())
                                .paymentMethod(bill.getPaymentMethod())
                                .paidTime(bill.getPaidTime())
                                .createdAt(bill.getCreatedAt())
                                .order(includeFullOrder && bill.getOrder() != null
                                                ? orderService.getOrderById(bill.getOrder().getOrderId())
                                                : null)
                                .restaurantName(branch.getRestaurant() != null ? branch.getRestaurant().getName()
                                                : null)
                                .branchAddress(branch.getAddress())
                                .branchPhone(branch.getBranchPhone())
                                .build();
        }

        private BillSummaryDTO toBillSummaryDTO(Bill bill) {
                return BillSummaryDTO.builder()
                                .billId(bill.getBillId())
                                .orderId(bill.getOrder() != null ? bill.getOrder().getOrderId() : null)
                                .tableName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getTag()
                                                : "N/A")
                                .areaName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getArea().getName()
                                                : "N/A")
                                .finalPrice(bill.getFinalPrice())
                                .paymentMethod(bill.getPaymentMethod())
                                .paidTime(bill.getPaidTime())
                                .build();
        }

        public long getTodayBillsCount(UUID branchId) {
                LocalDate today = LocalDate.now();
                Instant startOfDay = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
                Instant endOfDay = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

                return billRepository.countByBranchAndDateRange(branchId, startOfDay, endOfDay);
        }
}
