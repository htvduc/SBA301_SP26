package com.example.backend.services;

import com.example.backend.dto.ConversationVectorDTO;
import com.example.backend.entities.Branch;
import com.example.backend.entities.ConversationVector;
import com.example.backend.entities.Restaurant;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.ConversationVectorRepository;
import com.example.backend.repositories.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationVectorService {

    private final EmbeddingService embeddingService;
    private final ConversationVectorRepository conversationVectorRepository;
    private final RestaurantRepository restaurantRepository;
    private final BranchRepository branchRepository;

    @Transactional
    public void storeConversation(
            String sessionId,
            UUID restaurantId,
            UUID branchId,
            String userMessage,
            String aiResponse) {

        try {
            float[] userEmbedding = embeddingService.generateEmbedding(userMessage);
            float[] aiEmbedding = embeddingService.generateEmbedding(aiResponse);

            if (userEmbedding == null || aiEmbedding == null) {
                log.warn(
                        "Failed to generate embeddings for conversation (sessionId: {}, restaurantId: {}). Storing without embeddings.",
                        sessionId, restaurantId);
            }

            Restaurant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new IllegalArgumentException("Restaurant not found: " + restaurantId));

            Branch branch = null;
            if (branchId != null) {
                branch = branchRepository.findById(branchId)
                        .orElseThrow(() -> new IllegalArgumentException("Branch not found: " + branchId));
            }

            ConversationVector conversationVector = new ConversationVector();
            conversationVector.setSessionId(sessionId);
            conversationVector.setRestaurant(restaurant);
            conversationVector.setBranch(branch);
            conversationVector.setUserMessage(userMessage);
            conversationVector.setAiResponse(aiResponse);
            conversationVector.setUserMessageEmbedding(userEmbedding);
            conversationVector.setAiResponseEmbedding(aiEmbedding);
            conversationVector.setTimestamp(Instant.now());

            conversationVectorRepository.save(conversationVector);

            log.info("Successfully stored conversation vector (sessionId: {}, restaurantId: {}, branchId: {})",
                    sessionId, restaurantId, branchId);

        } catch (Exception e) {
            log.error("Failed to store conversation vector (sessionId: {}, restaurantId: {}, branchId: {}): {}",
                    sessionId, restaurantId, branchId, e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<ConversationVectorDTO> searchSimilar(
            String queryText,
            UUID restaurantId,
            UUID branchId,
            String excludeSessionId,
            int topK) {

        try {
            float[] queryEmbedding = embeddingService.generateEmbedding(queryText);

            if (queryEmbedding == null) {
                log.warn("Failed to generate embedding for query text. Returning empty list.");
                return new ArrayList<>();
            }

            String embeddingString = convertEmbeddingToString(queryEmbedding);

            List<Object[]> results = conversationVectorRepository.findSimilarConversations(
                    embeddingString,
                    restaurantId,
                    branchId,
                    excludeSessionId != null ? excludeSessionId : "",
                    topK);

            return results.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to search similar conversations (restaurantId: {}, branchId: {}): {}",
                    restaurantId, branchId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Transactional
    public void deleteBySessionId(String sessionId) {
        try {
            conversationVectorRepository.deleteBySessionId(sessionId);
            log.info("Successfully deleted conversation vectors for sessionId: {}", sessionId);
        } catch (Exception e) {
            log.error("Failed to delete conversation vectors for sessionId {}: {}", sessionId, e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteByRestaurantId(UUID restaurantId) {
        try {
            conversationVectorRepository.deleteByRestaurant_RestaurantId(restaurantId);
            log.info("Successfully deleted conversation vectors for restaurantId: {}", restaurantId);
        } catch (Exception e) {
            log.error("Failed to delete conversation vectors for restaurantId {}: {}", restaurantId, e.getMessage(), e);
        }
    }

    private String convertEmbeddingToString(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(embedding[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    private ConversationVectorDTO mapToDTO(Object[] row) {
        if (row[8] == null) {
        return null;
    }
        UUID conversationId = (UUID) row[0];
        String userMessage = (String) row[4];
        String aiResponse = (String) row[5];
        Object tsObj = row[6];

        Instant timestamp;
        if (tsObj instanceof java.sql.Timestamp) {
            timestamp = ((java.sql.Timestamp) tsObj).toInstant();
        } else if (tsObj instanceof Instant) {
            timestamp = (Instant) tsObj;
        } else {
            throw new IllegalStateException("Unknown timestamp type: " + tsObj.getClass());
        }
        float distance = ((Number) row[8]).floatValue();
        float similarityScore = 1.0f - distance;

        return new ConversationVectorDTO(
                conversationId,
                userMessage,
                aiResponse,
                timestamp,
                similarityScore);
    }
}
