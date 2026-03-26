package com.example.backend.services;

import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.DailyRevenueDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.entities.Bill;
import com.example.backend.entities.OrderStatus;
import com.example.backend.entities.ReportType;
import com.example.backend.repositories.BillRepository;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Collectors;

@Service
public class RestaurantReportService {

    private static final ZoneId VIETNAM_TIMEZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;
    private final BillRepository billRepository;

    public RestaurantReportService(OrderRepository orderRepository,
                                   BranchRepository branchRepository,
                                   BillRepository billRepository) {
        this.orderRepository = orderRepository;
        this.branchRepository = branchRepository;
        this.billRepository = billRepository;
    }

    /**
     * Get restaurant-wide analytics aggregated from all active branches
     */
    @Transactional(readOnly = true)
    public BranchAnalyticsDTO getRestaurantAnalytics(UUID restaurantId, ReportType timeframe) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Get all active branches for this restaurant
        List<com.example.backend.entities.Branch> branches = branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId);
        
        // Aggregate data from all branches
        int totalOrders = 0;
        int completedOrders = 0;
        int cancelledOrders = 0;
        int eatingOrders = 0;

        for (com.example.backend.entities.Branch branch : branches) {
            UUID branchId = branch.getBranchId();
            
            eatingOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.EATING, startDate, endDate);
            completedOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.COMPLETED, startDate, endDate);
            cancelledOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.CANCELLED, startDate, endDate);
            
        }

        totalOrders = eatingOrders + completedOrders + cancelledOrders;

        // Revenue/average should reflect paid bills after promotions
        BigDecimal totalRevenue = billRepository.sumFinalPriceByRestaurantAndDateRange(
                restaurantId, startDate, endDate);
        long paidBillCount = billRepository.countByRestaurantAndDateRange(
                restaurantId, startDate, endDate);

        // Calculate average order value
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (paidBillCount > 0) {
            avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(paidBillCount), 2, RoundingMode.HALF_UP);
        }

        // Build and return DTO
        BranchAnalyticsDTO dto = new BranchAnalyticsDTO();
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setCompletedOrders(completedOrders);
        dto.setCancelledOrders(cancelledOrders);
        dto.setAvgOrderValue(avgOrderValue);
        dto.setTimeframe(timeframe);

        return dto;
    }
    
    /**
     * Get branch-specific analytics (kept for backward compatibility)
     */
    @Transactional(readOnly = true)
    public BranchAnalyticsDTO getBranchAnalytics(UUID branchId, ReportType timeframe) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Get order counts by status
        int eatingOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.EATING, startDate, endDate);
        int completedOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.COMPLETED, startDate, endDate);
        int cancelledOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.CANCELLED, startDate, endDate);
        
        // Calculate total orders
        int totalOrders = eatingOrders + completedOrders + cancelledOrders;

        // Revenue/average should reflect paid bills after promotions
        BigDecimal totalRevenue = billRepository.sumFinalPriceByBranchAndDateRange(
                branchId, startDate, endDate);
        long paidBillCount = billRepository.countByBranchAndDateRange(
                branchId, startDate, endDate);

        // Calculate average order value (handle zero division)
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (paidBillCount > 0) {
            avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(paidBillCount), 2, RoundingMode.HALF_UP);
        }

        // Build and return DTO
        BranchAnalyticsDTO dto = new BranchAnalyticsDTO();
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setCompletedOrders(completedOrders);
        dto.setCancelledOrders(cancelledOrders);
        dto.setAvgOrderValue(avgOrderValue);
        dto.setTimeframe(timeframe);

        return dto;
    }

    /**
     * Get top selling items for restaurant (aggregated from all branches)
     */
    @Transactional(readOnly = true)
    public List<TopSellingItemDTO> getRestaurantTopSellingItems(UUID restaurantId, ReportType timeframe, int limit) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        List<Object[]> rows = orderRepository.findTopSellingItemRowsByRestaurant(
                restaurantId, OrderStatus.COMPLETED, startDate, endDate);
        return aggregateNetTopSelling(rows, limit);
    }

    @Transactional(readOnly = true)
    public List<OrderDistributionDTO> getRestaurantOrderDistribution(UUID restaurantId, LocalDate date) {
        // Calculate start and end of day in Asia/Ho_Chi_Minh timezone
        ZonedDateTime startOfDay = date.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        Instant startDate = startOfDay.toInstant();
        Instant endDate = endOfDay.toInstant();

        List<Instant> createdTimes = orderRepository.findOrderCreatedTimesByRestaurantAndDate(
                restaurantId, startDate, endDate);
        return buildHourlyDistribution(createdTimes);
    }

    @Transactional(readOnly = true)
    public List<TopSellingItemDTO> getTopSellingItems(UUID branchId, ReportType timeframe, int limit) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        List<Object[]> rows = orderRepository.findTopSellingItemRowsByBranch(
                branchId, OrderStatus.COMPLETED, startDate, endDate);
        return aggregateNetTopSelling(rows, limit);
    }

    @Transactional(readOnly = true)
    public List<OrderDistributionDTO> getOrderDistribution(UUID branchId, LocalDate date) {
        // Calculate start and end of day in Asia/Ho_Chi_Minh timezone
        ZonedDateTime startOfDay = date.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        Instant startDate = startOfDay.toInstant();
        Instant endDate = endOfDay.toInstant();

        List<Instant> createdTimes = orderRepository.findOrderCreatedTimesByBranchAndDate(
                branchId, startDate, endDate);
        return buildHourlyDistribution(createdTimes);
    }

    private List<OrderDistributionDTO> buildHourlyDistribution(List<Instant> createdTimes) {
        Map<Integer, Long> countByHour = createdTimes.stream()
                .collect(Collectors.groupingBy(
                        instant -> instant.atZone(VIETNAM_TIMEZONE).getHour(),
                        Collectors.counting()));

        return IntStream.range(0, 24)
                .mapToObj(hour -> new OrderDistributionDTO(hour, countByHour.getOrDefault(hour, 0L).intValue()))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private List<TopSellingItemDTO> aggregateNetTopSelling(List<Object[]> rows, int limit) {
        class Agg {
            String name;
            int qty;
            BigDecimal revenue = BigDecimal.ZERO;
        }

        Map<UUID, Agg> map = new HashMap<>();

        for (Object[] row : rows) {
            UUID menuItemId = (UUID) row[0];
            String menuItemName = (String) row[1];
            int quantity = ((Number) row[2]).intValue();
            BigDecimal itemTotal = (BigDecimal) row[3];
            BigDecimal orderTotal = (BigDecimal) row[4];
            BigDecimal billFinal = (BigDecimal) row[5];

            BigDecimal effectiveItemRevenue = itemTotal;
            if (orderTotal != null && orderTotal.compareTo(BigDecimal.ZERO) > 0 && billFinal != null) {
                effectiveItemRevenue = itemTotal.multiply(billFinal)
                        .divide(orderTotal, 2, RoundingMode.HALF_UP);
            }

            Agg agg = map.computeIfAbsent(menuItemId, ignored -> new Agg());
            agg.name = menuItemName;
            agg.qty += quantity;
            agg.revenue = agg.revenue.add(effectiveItemRevenue);
        }

        return map.entrySet().stream()
                .map(e -> new TopSellingItemDTO(
                        e.getKey(),
                        e.getValue().name,
                        e.getValue().qty,
                        e.getValue().revenue))
                .sorted(Comparator.comparing(TopSellingItemDTO::getTotalRevenue).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get daily revenue breakdown for a date range (restaurant-wide)
     */
    @Transactional(readOnly = true)
    public List<DailyRevenueDTO> getRestaurantDailyRevenue(UUID restaurantId, LocalDate startDate, LocalDate endDate) {
        ZonedDateTime start = startDate.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime end = endDate.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        List<Bill> bills = billRepository.findByRestaurantAndDateRange(
                restaurantId, start.toInstant(), end.toInstant());

        // Group bills by date
        Map<LocalDate, List<Bill>> billsByDate = bills.stream()
                .collect(Collectors.groupingBy(bill -> 
                    bill.getPaidTime().atZone(VIETNAM_TIMEZONE).toLocalDate()));

        // Get order counts by date
        List<com.example.backend.entities.Branch> branches = 
            branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId);

        List<DailyRevenueDTO> result = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            LocalDate date = currentDate;
            List<Bill> dayBills = billsByDate.getOrDefault(date, new ArrayList<>());
            
            BigDecimal dayRevenue = dayBills.stream()
                    .map(Bill::getFinalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Completed count matches revenue: one paid bill per completed order, grouped by paid day
            int completedOrders = dayBills.size();

            Instant dayStart = date.atStartOfDay(VIETNAM_TIMEZONE).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();

            int cancelledOrders = 0;
            for (com.example.backend.entities.Branch branch : branches) {
                cancelledOrders += orderRepository.countOrdersByBranchAndStatusAndUpdatedAtRange(
                        branch.getBranchId(), OrderStatus.CANCELLED, dayStart, dayEnd);
            }

            int totalOrders = completedOrders + cancelledOrders;

            result.add(new DailyRevenueDTO(date, dayRevenue, totalOrders, completedOrders, cancelledOrders));
            currentDate = currentDate.plusDays(1);
        }

        return result;
    }

    /**
     * Get daily revenue breakdown for a date range (branch-specific)
     */
    @Transactional(readOnly = true)
    public List<DailyRevenueDTO> getBranchDailyRevenue(UUID branchId, LocalDate startDate, LocalDate endDate) {
        ZonedDateTime start = startDate.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime end = endDate.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        List<Bill> bills = billRepository.findByBranchIdAndDateRange(
                branchId, start.toInstant(), end.toInstant());

        // Group bills by date
        Map<LocalDate, List<Bill>> billsByDate = bills.stream()
                .collect(Collectors.groupingBy(bill -> 
                    bill.getPaidTime().atZone(VIETNAM_TIMEZONE).toLocalDate()));

        List<DailyRevenueDTO> result = new ArrayList<>();
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            LocalDate date = currentDate;
            List<Bill> dayBills = billsByDate.getOrDefault(date, new ArrayList<>());
            
            BigDecimal dayRevenue = dayBills.stream()
                    .map(Bill::getFinalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int completedOrders = dayBills.size();

            Instant dayStart = date.atStartOfDay(VIETNAM_TIMEZONE).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();

            int cancelledOrders = orderRepository.countOrdersByBranchAndStatusAndUpdatedAtRange(
                    branchId, OrderStatus.CANCELLED, dayStart, dayEnd);
            int totalOrders = completedOrders + cancelledOrders;

            result.add(new DailyRevenueDTO(date, dayRevenue, totalOrders, completedOrders, cancelledOrders));
            currentDate = currentDate.plusDays(1);
        }

        return result;
    }
}