package com.example.backend.services;

import com.example.backend.config.VectorConfigProperties;
import com.example.backend.dto.AnalyticsContext;
import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.ConversationMessage;
import com.example.backend.dto.ConversationVectorDTO;
import com.example.backend.dto.DailyRevenueDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.dto.response.AIConsultantResponse;
import com.example.backend.entities.Branch;
import com.example.backend.entities.FeatureCode;
import com.example.backend.entities.ReportType;
import com.example.backend.exception.AIConsultantException;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIConsultantService {

    private final PromptBuilderService promptBuilderService;
    private final BedrockService bedrockService;
    private final ConversationService conversationService;
    private final ConversationVectorService conversationVectorService;
    private final RestaurantReportService restaurantReportService;
    private final RestaurantRepository restaurantRepository;
    private final BranchRepository branchRepository;
    private final FeatureLimitCheckerService featureLimitCheckerService;
    private final VectorConfigProperties vectorConfig;

    private AnalyticsContext gatherRestaurantAnalytics(UUID restaurantId, ReportType timeframe, LocalDate specificDate) {
        log.debug("Gathering restaurant analytics for restaurantId={}, timeframe={}", restaurantId, timeframe);
        
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        
        BranchAnalyticsDTO analytics = restaurantReportService.getRestaurantAnalytics(restaurantId, timeframe);
        List<TopSellingItemDTO> topSellingItems = restaurantReportService.getRestaurantTopSellingItems(restaurantId, timeframe, 10);
        
        List<OrderDistributionDTO> orderDistribution = null;
        if (specificDate != null) {
            orderDistribution = restaurantReportService.getRestaurantOrderDistribution(restaurantId, specificDate);
        }
        
        // Get daily revenue data based on timeframe
        LocalDate endDate = specificDate != null ? specificDate : LocalDate.now();
        LocalDate startDate;
        switch (timeframe) {
            case DAY:
                startDate = endDate.minusDays(6); // Last 7 days
                break;
            case MONTH:
                startDate = endDate.minusDays(29); // Last 30 days
                break;
            case YEAR:
                startDate = endDate.minusMonths(11).withDayOfMonth(1); // Last 12 months
                break;
            default:
                startDate = endDate.minusDays(6);
        }
        
        List<DailyRevenueDTO> dailyRevenue = restaurantReportService.getRestaurantDailyRevenue(
                restaurantId, startDate, endDate);
        
        return AnalyticsContext.builder()
                .analytics(analytics)
                .dailyRevenue(dailyRevenue)
                .topSellingItems(topSellingItems)
                .orderDistribution(orderDistribution)
                .timeframe(timeframe.name())
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .build();
    }

    private AnalyticsContext gatherBranchAnalytics(UUID branchId, ReportType timeframe, LocalDate specificDate) {
        log.debug("Gathering branch analytics for branchId={}, timeframe={}", branchId, timeframe);
        
        branchRepository.findById(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        
        BranchAnalyticsDTO analytics = restaurantReportService.getBranchAnalytics(branchId, timeframe);
        List<TopSellingItemDTO> topSellingItems = restaurantReportService.getTopSellingItems(branchId, timeframe, 10);
        
        List<OrderDistributionDTO> orderDistribution = null;
        if (specificDate != null) {
            orderDistribution = restaurantReportService.getOrderDistribution(branchId, specificDate);
        }
        
        // Get daily revenue data based on timeframe
        LocalDate endDate = specificDate != null ? specificDate : LocalDate.now();
        LocalDate startDate;
        switch (timeframe) {
            case DAY:
                startDate = endDate.minusDays(6); // Last 7 days
                break;
            case MONTH:
                startDate = endDate.minusDays(29); // Last 30 days
                break;
            case YEAR:
                startDate = endDate.minusMonths(11).withDayOfMonth(1); // Last 12 months
                break;
            default:
                startDate = endDate.minusDays(6);
        }
        
        List<DailyRevenueDTO> dailyRevenue = restaurantReportService.getBranchDailyRevenue(
                branchId, startDate, endDate);
        
        return AnalyticsContext.builder()
                .analytics(analytics)
                .dailyRevenue(dailyRevenue)
                .topSellingItems(topSellingItems)
                .orderDistribution(orderDistribution)
                .timeframe(timeframe.name())
                .startDate(startDate.toString())
                .endDate(endDate.toString())
                .build();
    }

    private AIConsultantResponse parseResponse(String aiResponse, String sessionId) {
        return AIConsultantResponse.builder()
                .response(aiResponse)
                .sessionId(sessionId)
                .timestamp(Instant.now())
                .build();
    }

    public AIConsultantResponse consultRestaurant(
            UUID restaurantId,
            String userQuestion,
            String sessionId,
            ReportType timeframe,
            LocalDate specificDate) {
        
        try {
            log.info("Processing AI consultation for restaurantId={}, sessionId={}", restaurantId, sessionId);
            
            // 1. Check premium subscription
            int limit = featureLimitCheckerService.getLimitValue(restaurantId, FeatureCode.AI_ASSISTANT);
            if (limit == 0) {
                log.warn("Restaurant {} does not have access to AI assistant feature", restaurantId);
                throw new AppException(ErrorCode.PREMIUM_FEATURE_REQUIRED);
            }
            
            // 2. Gather analytics
            AnalyticsContext context = gatherRestaurantAnalytics(restaurantId, timeframe, specificDate);
            
            // 3. Get conversation history with graceful degradation
            List<ConversationMessage> history;
            try {
                history = conversationService.getHistory(sessionId);
            } catch (Exception e) {
                log.warn("Failed to retrieve conversation history for session {}: {}", sessionId, e.getMessage());
                history = List.of();
            }
            
            // 4. Retrieve semantically similar conversations with graceful degradation
            List<ConversationVectorDTO> retrievedContext;
            try {
                retrievedContext = conversationVectorService.searchSimilar(userQuestion, restaurantId, null, sessionId, vectorConfig.getTopK());
            } catch (Exception e) {
                log.warn("Failed to retrieve vector context for session {}: {}", sessionId, e.getMessage());
                retrievedContext = List.of();
            }
            
            // 5. Build prompt with hybrid memory
            String prompt = promptBuilderService.buildPrompt(context, userQuestion, history, retrievedContext);
            
            // 6. Invoke Bedrock service
            String aiResponse = bedrockService.invokeModel(prompt);
            
            // 7. Save to conversation history with graceful degradation
            try {
                conversationService.saveMessage(sessionId, userQuestion, aiResponse);
            } catch (Exception e) {
                log.warn("Failed to save conversation history for session {}: {}", sessionId, e.getMessage());
            }
            
            // 8. Store conversation in vector memory with graceful degradation
            try {
                conversationVectorService.storeConversation(sessionId, restaurantId, null, userQuestion, aiResponse);
            } catch (Exception e) {
                log.warn("Failed to store conversation vector for session {}: {}", sessionId, e.getMessage());
            }
            
            // 9. Parse and return
            return parseResponse(aiResponse, sessionId);
            
        } catch (AppException e) {
            // Re-throw AppException as-is
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during AI consultation for restaurant {}", restaurantId, e);
            throw new AIConsultantException("Failed to process AI consultation request", e);
        }
    }

    public AIConsultantResponse consultBranch(
            UUID branchId,
            String userQuestion,
            String sessionId,
            ReportType timeframe,
            LocalDate specificDate) {
        
        try {
            log.info("Processing AI consultation for branchId={}, sessionId={}", branchId, sessionId);
            
            // 1. Get restaurant ID from branch
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
            UUID restaurantId = branch.getRestaurant().getRestaurantId();
            
            // 2. Check premium subscription
            int limit = featureLimitCheckerService.getLimitValue(restaurantId, FeatureCode.AI_ASSISTANT);
            if (limit == 0) {
                log.warn("Restaurant {} does not have access to AI assistant feature", restaurantId);
                throw new AppException(ErrorCode.PREMIUM_FEATURE_REQUIRED);
            }
            
            // 3. Gather analytics
            AnalyticsContext context = gatherBranchAnalytics(branchId, timeframe, specificDate);
            
            // 4. Get conversation history with graceful degradation
            List<ConversationMessage> history;
            try {
                history = conversationService.getHistory(sessionId);
            } catch (Exception e) {
                log.warn("Failed to retrieve conversation history for session {}: {}", sessionId, e.getMessage());
                history = List.of();
            }
            
            // 5. Retrieve semantically similar conversations with graceful degradation
            List<ConversationVectorDTO> retrievedContext;
            try {
                retrievedContext = conversationVectorService.searchSimilar(userQuestion, restaurantId, branchId, sessionId, vectorConfig.getTopK());
            } catch (Exception e) {
                log.warn("Failed to retrieve vector context for session {}: {}", sessionId, e.getMessage());
                retrievedContext = List.of();
            }
            
            // 6. Build prompt with hybrid memory
            String prompt = promptBuilderService.buildPrompt(context, userQuestion, history, retrievedContext);
            
            // 7. Invoke Bedrock service
            String aiResponse = bedrockService.invokeModel(prompt);
            
            // 8. Save to conversation history with graceful degradation
            try {
                conversationService.saveMessage(sessionId, userQuestion, aiResponse);
            } catch (Exception e) {
                log.warn("Failed to save conversation history for session {}: {}", sessionId, e.getMessage());
            }
            
            // 9. Store conversation in vector memory with graceful degradation
            try {
                conversationVectorService.storeConversation(sessionId, restaurantId, branchId, userQuestion, aiResponse);
            } catch (Exception e) {
                log.warn("Failed to store conversation vector for session {}: {}", sessionId, e.getMessage());
            }
            
            // 10. Parse and return
            return parseResponse(aiResponse, sessionId);
            
        } catch (AppException e) {
            // Re-throw AppException as-is
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during AI consultation for branch {}", branchId, e);
            throw new AIConsultantException("Failed to process AI consultation request", e);
        }
    }
}
