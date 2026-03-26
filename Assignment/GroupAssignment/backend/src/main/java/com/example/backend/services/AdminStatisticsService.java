package com.example.backend.services;

import com.example.backend.dto.AdminStatisticsDTO;
import com.example.backend.dto.PackageStatsDTO;
import com.example.backend.dto.WeeklyRevenueDTO;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.SubscriptionPaymentRepository;
import com.example.backend.repositories.SubscriptionRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminStatisticsService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;

    public AdminStatisticsService(UserRepository userRepository,
                                  RestaurantRepository restaurantRepository,
                                  SubscriptionRepository subscriptionRepository,
                                  SubscriptionPaymentRepository subscriptionPaymentRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
    }

    public AdminStatisticsDTO getAdminStatistics() {
        AdminStatisticsDTO stats = new AdminStatisticsDTO();
        
        // Basic counts
        stats.setTotalUsers(userRepository.count());
        stats.setTotalRestaurants(restaurantRepository.count());
        stats.setActiveSubscriptions(subscriptionRepository.countActiveSubscriptions());
        
        // Current month revenue
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now.withDayOfMonth(now.lengthOfMonth());
        
        Instant monthStartInstant = monthStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant monthEndInstant = monthEnd.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        Long monthlyRevenueAmount = subscriptionPaymentRepository.findTotalRevenueByDateRange(monthStartInstant, monthEndInstant);
        stats.setMonthlyRevenue(BigDecimal.valueOf(monthlyRevenueAmount != null ? monthlyRevenueAmount : 0));
        
        // Package statistics for current week
        stats.setPackageStats(getWeeklyPackageStats());
        
        // Weekly revenue for last 8 weeks
        stats.setWeeklyRevenue(getWeeklyRevenue(8));
        
        return stats;
    }

    private List<PackageStatsDTO> getWeeklyPackageStats() {
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(6);
        
        // Get active subscription distribution (current state of subscriptions)
        List<Object[]> distributionResults = subscriptionRepository.findActiveSubscriptionDistribution();
        
        // Get payment stats for revenue and transaction details
        Instant startInstant = weekStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = weekEnd.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        List<Object[]> paymentResults = subscriptionPaymentRepository.findPackageStatsByDateRange(startInstant, endInstant);
        
        // Create maps for payment data
        var paymentDataMap = new java.util.HashMap<String, Object[]>();
        for (Object[] result : paymentResults) {
            String packageName = (String) result[0];
            paymentDataMap.put(packageName, result);
        }
        
        List<PackageStatsDTO> packageStats = new ArrayList<>();
        String period = weekStart.format(DateTimeFormatter.ofPattern("MMM dd")) + " - " + 
                       weekEnd.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        
        // Build stats based on active subscription distribution
        for (Object[] result : distributionResults) {
            String packageName = (String) result[0];
            Long activeSubscriptions = ((Number) result[1]).longValue();
            
            // Get payment data if exists
            Object[] paymentData = paymentDataMap.get(packageName);
            Long newSubs = 0L;
            Long renewals = 0L;
            Long upgrades = 0L;
            BigDecimal revenue = BigDecimal.ZERO;
            
            if (paymentData != null) {
                newSubs = ((Number) paymentData[1]).longValue();
                renewals = ((Number) paymentData[2]).longValue();
                upgrades = ((Number) paymentData[3]).longValue();
                revenue = BigDecimal.valueOf(((Number) paymentData[4]).longValue());
            }
            
            PackageStatsDTO dto = new PackageStatsDTO(packageName, newSubs, renewals, upgrades, revenue, period);
            // Override totalSubscriptions with actual active subscription count
            dto.setTotalSubscriptions(activeSubscriptions);
            packageStats.add(dto);
        }
        
        return packageStats;
    }

    private List<WeeklyRevenueDTO> getWeeklyRevenue(int weeks) {
        List<WeeklyRevenueDTO> weeklyRevenue = new ArrayList<>();
        LocalDate now = LocalDate.now();
        
        for (int i = weeks - 1; i >= 0; i--) {
            LocalDate weekStart = now.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate weekEnd = weekStart.plusDays(6);
            
            Instant startInstant = weekStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endInstant = weekEnd.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
            
            Long revenue = subscriptionPaymentRepository.findTotalRevenueByDateRange(startInstant, endInstant);
            
            // Count transactions for the week
            List<Object[]> dailyData = subscriptionPaymentRepository.findDailyRevenueByDateRange(startInstant, endInstant);
            Long totalTransactions = dailyData.stream()
                    .mapToLong(data -> ((Number) data[2]).longValue())
                    .sum();
            
            String weekLabel = weekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
            
            weeklyRevenue.add(new WeeklyRevenueDTO(
                weekStart, 
                weekEnd, 
                weekLabel,
                BigDecimal.valueOf(revenue != null ? revenue : 0),
                totalTransactions
            ));
        }
        
        return weeklyRevenue;
    }

    public List<PackageStatsDTO> getPackageStatsByDateRange(LocalDate startDate, LocalDate endDate) {
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        // Get active subscription distribution (current state of subscriptions)
        List<Object[]> distributionResults = subscriptionRepository.findActiveSubscriptionDistribution();
        
        // Get payment stats for revenue and transaction details
        List<Object[]> paymentResults = subscriptionPaymentRepository.findPackageStatsByDateRange(startInstant, endInstant);
        
        // Create maps for payment data
        var paymentDataMap = new java.util.HashMap<String, Object[]>();
        for (Object[] result : paymentResults) {
            String packageName = (String) result[0];
            paymentDataMap.put(packageName, result);
        }
        
        List<PackageStatsDTO> packageStats = new ArrayList<>();
        String period = startDate.format(DateTimeFormatter.ofPattern("MMM dd")) + " - " + 
                       endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
        
        // Build stats based on active subscription distribution
        for (Object[] result : distributionResults) {
            String packageName = (String) result[0];
            Long activeSubscriptions = ((Number) result[1]).longValue();
            
            // Get payment data if exists
            Object[] paymentData = paymentDataMap.get(packageName);
            Long newSubs = 0L;
            Long renewals = 0L;
            Long upgrades = 0L;
            BigDecimal revenue = BigDecimal.ZERO;
            
            if (paymentData != null) {
                newSubs = ((Number) paymentData[1]).longValue();
                renewals = ((Number) paymentData[2]).longValue();
                upgrades = ((Number) paymentData[3]).longValue();
                revenue = BigDecimal.valueOf(((Number) paymentData[4]).longValue());
            }
            
            PackageStatsDTO dto = new PackageStatsDTO(packageName, newSubs, renewals, upgrades, revenue, period);
            // Override totalSubscriptions with actual active subscription count
            dto.setTotalSubscriptions(activeSubscriptions);
            packageStats.add(dto);
        }
        
        return packageStats;
    }

    public AdminStatisticsDTO getAdminStatisticsByDateRange(LocalDate startDate, LocalDate endDate) {
        AdminStatisticsDTO stats = new AdminStatisticsDTO();

        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

        // Basic counts (these remain the same as they are cumulative)
        stats.setTotalUsers(userRepository.count());
        stats.setTotalRestaurants(restaurantRepository.count());
        stats.setActiveSubscriptions(subscriptionRepository.countActiveSubscriptions());

        // Revenue for the specified date range
        Long totalRevenueAmount = subscriptionPaymentRepository.findTotalRevenueByDateRange(startInstant, endInstant);
        stats.setMonthlyRevenue(BigDecimal.valueOf(totalRevenueAmount != null ? totalRevenueAmount : 0));

        // Package statistics for the specified date range
        stats.setPackageStats(getPackageStatsByDateRange(startDate, endDate));

        // Weekly revenue within the date range
        stats.setWeeklyRevenue(getWeeklyRevenueByDateRange(startDate, endDate));

        return stats;
    }

    private List<WeeklyRevenueDTO> getWeeklyRevenueByDateRange(LocalDate startDate, LocalDate endDate) {
        List<WeeklyRevenueDTO> weeklyRevenue = new ArrayList<>();

        // Start from the Monday of the week containing startDate
        LocalDate currentWeekStart = startDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        while (!currentWeekStart.isAfter(endDate)) {
            LocalDate weekEnd = currentWeekStart.plusDays(6);

            // Adjust week end if it goes beyond the specified end date
            if (weekEnd.isAfter(endDate)) {
                weekEnd = endDate;
            }

            Instant startInstant = currentWeekStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endInstant = weekEnd.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            Long revenue = subscriptionPaymentRepository.findTotalRevenueByDateRange(startInstant, endInstant);

            // Count transactions for the week
            List<Object[]> dailyData = subscriptionPaymentRepository.findDailyRevenueByDateRange(startInstant, endInstant);
            Long totalTransactions = dailyData.stream()
                    .mapToLong(data -> ((Number) data[2]).longValue())
                    .sum();

            String weekLabel = currentWeekStart.format(DateTimeFormatter.ofPattern("MMM dd"));
            if (!weekEnd.equals(currentWeekStart.plusDays(6))) {
                // If this is a partial week, show the actual date range
                weekLabel = currentWeekStart.format(DateTimeFormatter.ofPattern("MMM dd")) +
                           "-" + weekEnd.format(DateTimeFormatter.ofPattern("dd"));
            }

            weeklyRevenue.add(new WeeklyRevenueDTO(
                currentWeekStart,
                weekEnd,
                weekLabel,
                BigDecimal.valueOf(revenue != null ? revenue : 0),
                totalTransactions
            ));

            currentWeekStart = currentWeekStart.plusWeeks(1);
        }

        return weeklyRevenue;
    }
}