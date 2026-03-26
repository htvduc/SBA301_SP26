package com.example.backend.services;

import com.example.backend.config.VectorConfigProperties;
import com.example.backend.dto.AnalyticsContext;
import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.ConversationMessage;
import com.example.backend.dto.ConversationVectorDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromptBuilderService {

    private final VectorConfigProperties vectorConfig;
    
    private static final int MAX_HISTORY_MESSAGES = 5;
    private static final int APPROX_CHARS_PER_TOKEN = 4;
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());

    public String buildPrompt(
            AnalyticsContext context,
            String userQuestion,
            List<ConversationMessage> history,
            List<ConversationVectorDTO> retrievedContext) {

        StringBuilder prompt = new StringBuilder();

        prompt.append(buildRoleSection());
        prompt.append(buildDataSection(context));
        
        if (retrievedContext != null && !retrievedContext.isEmpty()) {
            prompt.append(buildRetrievedContextSection(retrievedContext));
        }
        
        prompt.append(buildConstraintsSection());
        prompt.append(buildResponseFormatSection());

        if (history != null && !history.isEmpty()) {
            prompt.append(buildHistorySection(history));
        }

        prompt.append("\n\nUser Question: ").append(userQuestion);

        return prompt.toString();
    }

    private String buildRoleSection() {
        return """
            You are a professional restaurant business consultant with expertise in \
            data-driven decision making, revenue optimization, and operational efficiency.\
            """;
    }

    private String buildDataSection(AnalyticsContext context) {
        StringBuilder data = new StringBuilder("\n\n=== RESTAURANT PERFORMANCE DATA ===\n");

        if (context.getAnalytics() != null) {
            BranchAnalyticsDTO analytics = context.getAnalytics();
            data.append(String.format("""
                Timeframe: %s
                Total Revenue: %s VND
                Total Orders: %d
                Completed Orders: %d
                Cancelled Orders: %d
                Average Order Value: %s VND
                """,
                context.getTimeframe(),
                analytics.getTotalRevenue(),
                analytics.getTotalOrders(),
                analytics.getCompletedOrders(),
                analytics.getCancelledOrders(),
                analytics.getAvgOrderValue()));
        }

        if (context.getDailyRevenue() != null && !context.getDailyRevenue().isEmpty()) {
            data.append("\n=== DAILY REVENUE TREND ===\n");
            data.append(String.format("Period: %s to %s\n", context.getStartDate(), context.getEndDate()));
            for (var day : context.getDailyRevenue()) {
                data.append(String.format("- %s: %s VND (%d orders, %d completed, %d cancelled)\n",
                    day.getDate(),
                    day.getRevenue(),
                    day.getOrderCount(),
                    day.getCompletedOrders(),
                    day.getCancelledOrders()));
            }
        }

        if (context.getTopSellingItems() != null && !context.getTopSellingItems().isEmpty()) {
            data.append("\n=== TOP SELLING ITEMS ===\n");
            for (TopSellingItemDTO item : context.getTopSellingItems()) {
                data.append(String.format("- %s: %d sold, %s VND revenue\n",
                    item.getMenuItemName(),
                    item.getQuantitySold(),
                    item.getTotalRevenue()));
            }
        }

        if (context.getOrderDistribution() != null && !context.getOrderDistribution().isEmpty()) {
            data.append("\n=== ORDER DISTRIBUTION BY HOUR ===\n");
            List<OrderDistributionDTO> peakHours = context.getOrderDistribution().stream()
                .sorted(Comparator.comparing(OrderDistributionDTO::getOrderCount).reversed())
                .limit(5)
                .toList();

            for (OrderDistributionDTO dist : peakHours) {
                data.append(String.format("- %02d:00-%02d:00: %d orders\n",
                    dist.getHour(), dist.getHour() + 1, dist.getOrderCount()));
            }
        }

        return data.toString();
    }

    private String buildConstraintsSection() {
        return """
            
            === CRITICAL CONSTRAINTS ===
            1. Base ALL analysis ONLY on the data provided above
            2. DO NOT make up numbers or assume missing values
            3. If data is insufficient to answer a question, explicitly state this
            4. Reference specific data points when making recommendations
            5. Do not hallucinate trends or patterns not present in the data
            """;
    }

    private String buildResponseFormatSection() {
        return """
            
            === RESPONSE FORMAT ===
            Structure your response in four sections:
            
            1. ANALYSIS: Summarize key metrics and observable trends from the data
            2. INSIGHTS: Explain WHY these patterns exist based on the data
            3. RECOMMENDATIONS: Provide specific, actionable steps to improve performance
            4. RISKS: Identify potential problems and their consequences if unaddressed
            
            Use clear, non-technical language accessible to restaurant owners.
            """;
    }

    private String buildHistorySection(List<ConversationMessage> history) {
        StringBuilder historySection = new StringBuilder("\n\n=== CONVERSATION HISTORY ===\n");

        int maxMessages = Math.min(MAX_HISTORY_MESSAGES, history.size());
        List<ConversationMessage> recentHistory = history.subList(
            Math.max(0, history.size() - maxMessages),
            history.size()
        );

        for (ConversationMessage msg : recentHistory) {
            historySection.append(String.format("User: %s\n", msg.getUserMessage()));
            historySection.append(String.format("Assistant: %s\n\n", msg.getAiResponse()));
        }

        return historySection.toString();
    }

    private String buildRetrievedContextSection(List<ConversationVectorDTO> retrievedContext) {
        StringBuilder contextSection = new StringBuilder("\n\n=== RETRIEVED CONTEXT ===\n");
        contextSection.append("Below are relevant past conversations that may provide useful context:\n\n");

        int maxChars = vectorConfig.getMaxContextTokens() * APPROX_CHARS_PER_TOKEN;
        int currentChars = 0;

        for (ConversationVectorDTO conv : retrievedContext) {
            String formattedConv = formatRetrievedConversation(conv);
            int convLength = formattedConv.length();

            if (currentChars + convLength > maxChars) {
                break;
            }

            contextSection.append(formattedConv);
            currentChars += convLength;
        }

        contextSection.append("\nWhen relevant, reference insights from these past conversations in your response.\n");

        return contextSection.toString();
    }

    private String formatRetrievedConversation(ConversationVectorDTO conv) {
        String timestamp = TIMESTAMP_FORMATTER.format(conv.getTimestamp());
        float similarityPercent = conv.getSimilarityScore() * 100;

        return String.format("""
            [%s | Similarity: %.1f%%]
            User: %s
            Assistant: %s
            
            """,
            timestamp,
            similarityPercent,
            conv.getUserMessage(),
            conv.getAiResponse());
    }
}
