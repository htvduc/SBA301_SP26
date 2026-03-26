package com.example.backend.entities;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.Type;

import io.hypersistence.utils.hibernate.type.array.FloatArrayType;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversation_vectors")
public class ConversationVector {
    
    @Id
    @Column(name = "conversation_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID conversationId;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_id")
    private Restaurant restaurant;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Column(name = "user_message", columnDefinition = "TEXT", nullable = false)
    private String userMessage;
    
    @Column(name = "ai_response", columnDefinition = "TEXT", nullable = false)
    private String aiResponse;
    
    @Type(FloatArrayType.class)
    @Column(name = "user_message_embedding", columnDefinition = "vector(1536)")
    private float[] userMessageEmbedding;
    
    @Type(FloatArrayType.class)
    @Column(name = "ai_response_embedding", columnDefinition = "vector(1536)")
    private float[] aiResponseEmbedding;
    
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;
    
    @Type(JsonBinaryType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    public UUID getConversationId() {
        return conversationId;
    }

    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public void setUserMessage(String userMessage) {
        this.userMessage = userMessage;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public void setAiResponse(String aiResponse) {
        this.aiResponse = aiResponse;
    }

    public float[] getUserMessageEmbedding() {
        return userMessageEmbedding;
    }

    public void setUserMessageEmbedding(float[] userMessageEmbedding) {
        this.userMessageEmbedding = userMessageEmbedding;
    }

    public float[] getAiResponseEmbedding() {
        return aiResponseEmbedding;
    }

    public void setAiResponseEmbedding(float[] aiResponseEmbedding) {
        this.aiResponseEmbedding = aiResponseEmbedding;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
