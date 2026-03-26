package com.example.backend.services;

import com.example.backend.exception.AIConsultantException;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class BedrockService {

    private final BedrockRuntimeClient client;
    private final ObjectMapper objectMapper;
    
    private static final String MODEL_ID = "anthropic.claude-3-5-sonnet-20240620-v1:0";
    private static final int MAX_TOKENS = 2000;

    public String invokeModel(String prompt) {
        try {
            String requestBody = buildRequestBody(prompt);
            
            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(MODEL_ID)
                    .body(SdkBytes.fromUtf8String(requestBody))
                    .build();
            
            InvokeModelResponse response = client.invokeModel(request);
            
            return parseResponse(response);
            
        } catch (SdkClientException e) {
            log.error("Failed to connect to Amazon Bedrock service", e);
            throw new AIConsultantException("Unable to connect to AI service. Please try again later.", e);
        } catch (BedrockRuntimeException e) {
            log.error("Bedrock API error occurred", e);
            throw new AIConsultantException("AI service encountered an error. Please try again later.", e);
        } catch (JsonProcessingException e) {
            log.error("Failed to process JSON for Bedrock request/response", e);
            throw new AIConsultantException("Failed to process AI request or response.", e);
        }
    }
    
    private String buildRequestBody(String prompt) throws JsonProcessingException {
        Map<String, Object> requestMap = new HashMap<>();
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        
        requestMap.put("messages", messages);
        requestMap.put("max_tokens", MAX_TOKENS);
        requestMap.put("anthropic_version", "bedrock-2023-05-31");
        
        return objectMapper.writeValueAsString(requestMap);
    }
    
    private String parseResponse(InvokeModelResponse response) throws JsonProcessingException {
        String responseBody = response.body().asUtf8String();
        
        JsonNode rootNode = objectMapper.readTree(responseBody);
        
        // Extract content from Claude response format
        // Expected structure: { "content": [{ "text": "..." }], ... }
        JsonNode contentArray = rootNode.get("content");
        if (contentArray != null && contentArray.isArray() && contentArray.size() > 0) {
            JsonNode firstContent = contentArray.get(0);
            JsonNode textNode = firstContent.get("text");
            if (textNode != null) {
                return textNode.asText();
            }
        }
        
        log.error("Unexpected response format from Bedrock: {}", responseBody);
        throw new AIConsultantException("Unexpected response format from AI service");
    }

    public String callClaude(String userMessage) {

        String body = """
        {
          "messages": [
            {
              "role": "user",
              "content": "%s"
            }
          ],
          "max_tokens": 300
        }
        """.formatted(userMessage);

        InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId("anthropic.claude-3-5-sonnet-20241022-v2:0")
                .body(SdkBytes.fromUtf8String(body))
                .build();

        InvokeModelResponse response = client.invokeModel(request);

        return response.body().asUtf8String();
    }
}