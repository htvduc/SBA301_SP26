package com.example.backend.services;

import com.example.backend.config.VectorConfigProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.BedrockRuntimeException;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final BedrockRuntimeClient bedrockRuntimeClient;
    private final ObjectMapper objectMapper;
    private final VectorConfigProperties vectorConfig;
    
    private static final int EMBEDDING_DIMENSION = 1024;
    
    // Session-level embedding cache
    private final Map<String, float[]> embeddingCache = new ConcurrentHashMap<>();

    /**
     * Generates a 1536-dimensional embedding vector for the given text using AWS Bedrock Titan Embeddings.
     * 
     * @param text The text to generate an embedding for
     * @return A float array of 1536 dimensions, or null if generation fails
     */
    public float[] generateEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            log.warn("Cannot generate embedding for null or empty text");
            return null;
        }

        // Check cache first
        String cacheKey = text.trim();
        if (embeddingCache.containsKey(cacheKey)) {
            log.debug("Returning cached embedding for text (length: {})", text.length());
            return embeddingCache.get(cacheKey);
        }

        // Generate embedding with retry logic
        float[] embedding = generateEmbeddingWithRetry(text, vectorConfig.getRetry().getMaxAttempts());
        
        // Cache the result if successful
        if (embedding != null) {
            embeddingCache.put(cacheKey, embedding);
        }
        
        return embedding;
    }

    /**
     * Generates embeddings for multiple texts in batch.
     * 
     * @param texts List of texts to generate embeddings for
     * @return List of float arrays (1536 dimensions each), with null entries for failed generations
     */
    public List<float[]> generateEmbeddings(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            log.warn("Cannot generate embeddings for null or empty text list");
            return new ArrayList<>();
        }

        List<float[]> embeddings = new ArrayList<>();
        for (String text : texts) {
            embeddings.add(generateEmbedding(text));
        }
        
        return embeddings;
    }

    /**
     * Generates embedding with exponential backoff retry logic.
     */
    private float[] generateEmbeddingWithRetry(String text, int attemptsRemaining) {
        int maxAttempts = vectorConfig.getRetry().getMaxAttempts();
        int currentAttempt = maxAttempts - attemptsRemaining + 1;
        
        try {
            return invokeEmbeddingModel(text);
        } catch (SdkClientException e) {
            log.error("AWS SDK client error during embedding generation (attempt {}/{}): {}", 
                    currentAttempt, maxAttempts, e.getMessage());
            return retryOrFail(text, attemptsRemaining, currentAttempt);
        } catch (BedrockRuntimeException e) {
            log.error("Bedrock runtime error during embedding generation (attempt {}/{}): {}", 
                    currentAttempt, maxAttempts, e.getMessage());
            return retryOrFail(text, attemptsRemaining, currentAttempt);
        } catch (JsonProcessingException e) {
            log.error("JSON processing error during embedding generation (attempt {}/{}): {}", 
                    currentAttempt, maxAttempts, e.getMessage());
            return retryOrFail(text, attemptsRemaining, currentAttempt);
        } catch (Exception e) {
            log.error("Unexpected error during embedding generation (attempt {}/{}): {}", 
                    currentAttempt, maxAttempts, e.getMessage(), e);
            return retryOrFail(text, attemptsRemaining, currentAttempt);
        }
    }

    /**
     * Handles retry logic with exponential backoff.
     */
    private float[] retryOrFail(String text, int attemptsRemaining, int currentAttempt) {
        int maxAttempts = vectorConfig.getRetry().getMaxAttempts();
        if (attemptsRemaining > 1) {
            long backoffMs = vectorConfig.getRetry().getBackoffMs() * (long) Math.pow(2, currentAttempt - 1);
            log.info("Retrying embedding generation after {}ms (attempt {}/{})", 
                    backoffMs, currentAttempt, maxAttempts);
            
            try {
                Thread.sleep(backoffMs);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.error("Retry backoff interrupted", ie);
                return null;
            }
            
            return generateEmbeddingWithRetry(text, attemptsRemaining - 1);
        } else {
            log.error("Failed to generate embedding after {} attempts for text (length: {})", 
                    maxAttempts, text.length());
            return null;
        }
    }

    /**
     * Invokes the AWS Bedrock Titan Embeddings model.
     */
    private float[] invokeEmbeddingModel(String text) throws JsonProcessingException {
        log.info("Embedding model: {}", vectorConfig.getEmbeddingModel());
        // Build request body for Titan Embeddings
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputText", text);
        
        String requestJson = objectMapper.writeValueAsString(requestBody);
        
        // Invoke model
        InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(vectorConfig.getEmbeddingModel())
                .body(SdkBytes.fromUtf8String(requestJson))
                .build();
        
        InvokeModelResponse response = bedrockRuntimeClient.invokeModel(request);
        
        // Parse response
        return parseEmbeddingResponse(response);
    }

    /**
     * Parses the embedding response from AWS Bedrock Titan Embeddings.
     */
    private float[] parseEmbeddingResponse(InvokeModelResponse response) throws JsonProcessingException {
        String responseBody = response.body().asUtf8String();
        
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode embeddingNode = rootNode.get("embedding");
        
        if (embeddingNode == null || !embeddingNode.isArray()) {
            log.error("Invalid embedding response format: {}", responseBody);
            throw new IllegalStateException("Invalid embedding response format");
        }
        
        // Convert JSON array to float array
        float[] embedding = new float[embeddingNode.size()];
        for (int i = 0; i < embeddingNode.size(); i++) {
            embedding[i] = (float) embeddingNode.get(i).asDouble();
        }
        
        // Validate dimension
        if (embedding.length != EMBEDDING_DIMENSION) {
            log.error("Unexpected embedding dimension: expected {}, got {}", 
                    EMBEDDING_DIMENSION, embedding.length);
            throw new IllegalStateException("Unexpected embedding dimension");
        }
        
        log.debug("Successfully generated embedding with {} dimensions", embedding.length);
        return embedding;
    }

    /**
     * Clears the embedding cache. Useful for testing or memory management.
     */
    public void clearCache() {
        embeddingCache.clear();
        log.info("Embedding cache cleared");
    }

    /**
     * Returns the current cache size.
     */
    public int getCacheSize() {
        return embeddingCache.size();
    }
}
