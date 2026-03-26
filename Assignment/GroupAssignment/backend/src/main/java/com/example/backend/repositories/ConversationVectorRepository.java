package com.example.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.ConversationVector;

@Repository
public interface ConversationVectorRepository extends JpaRepository<ConversationVector, UUID> {

    @Query(value = """
            SELECT cv.conversation_id, cv.session_id, cv.restaurant_id, cv.branch_id,
                   cv.user_message, cv.ai_response, cv.timestamp, cv.metadata,
                   (cv.user_message_embedding <=> CAST(:queryEmbedding AS vector)) as distance
            FROM conversation_vectors cv
            WHERE cv.restaurant_id = :restaurantId
              AND (:branchId IS NULL OR cv.branch_id = :branchId)
              AND cv.session_id != :excludeSessionId
              AND cv.user_message_embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT :topK
            """, nativeQuery = true)
    List<Object[]> findSimilarConversations(
            @Param("queryEmbedding") String queryEmbedding,
            @Param("restaurantId") UUID restaurantId,
            @Param("branchId") UUID branchId,
            @Param("excludeSessionId") String excludeSessionId,
            @Param("topK") int topK);

    void deleteBySessionId(String sessionId);

    void deleteByRestaurant_RestaurantId(UUID restaurantId);
}
