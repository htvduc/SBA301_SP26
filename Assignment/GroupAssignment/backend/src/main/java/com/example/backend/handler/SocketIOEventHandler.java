package com.example.backend.handler;

import com.corundumstudio.socketio.SocketIOClient;
import com.example.backend.exception.JwtAuthenticationException;
import com.example.backend.services.JwtService;
import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketIOEventHandler {

    private final JwtService jwtService;

    public void onConnect(SocketIOClient client) {
        log.info("Client connection attempt - Session ID: {}", client.getSessionId());
    }

    public void onAuthenticate(SocketIOClient client, String token) {
        try {
            SignedJWT jwt = jwtService.validateAccessToken(token);
            
            String role = jwt.getJWTClaimsSet().getStringClaim("role");
            String branchIdStr = jwt.getJWTClaimsSet().getStringClaim("branchId");
            
            if (role == null || branchIdStr == null) {
                log.error("Authentication failed - Missing role or branchId in JWT claims - Session ID: {}", client.getSessionId());
                client.sendEvent("error", "Authentication failed: Missing required claims");
                client.disconnect();
                return;
            }
            
            UUID branchId = UUID.fromString(branchIdStr);
            String roomName = "branch:" + branchId + ":" + role.toLowerCase();
            
            client.joinRoom(roomName);
            client.set("branchId", branchId);
            client.set("role", role);
            
            log.info("=== CLIENT AUTHENTICATED ===");
            log.info("Session ID: {}", client.getSessionId());
            log.info("Room: {}", roomName);
            log.info("Role: {}", role);
            log.info("BranchId: {}", branchId);
            log.info("✅ Client successfully joined room '{}'", roomName);
            
            client.sendEvent("authenticated", "Authentication successful");
            
        } catch (JwtAuthenticationException e) {
            log.error("Authentication failed - Invalid or expired token - Session ID: {}, Error: {}", 
                    client.getSessionId(), e.getMessage());
            client.sendEvent("error", "Authentication failed: " + e.getMessage());
            client.disconnect();
        } catch (ParseException e) {
            log.error("Authentication failed - Error parsing JWT claims - Session ID: {}", 
                    client.getSessionId(), e);
            client.sendEvent("error", "Authentication failed: Invalid token format");
            client.disconnect();
        } catch (IllegalArgumentException e) {
            log.error("Authentication failed - Invalid branchId format - Session ID: {}", 
                    client.getSessionId(), e);
            client.sendEvent("error", "Authentication failed: Invalid branchId");
            client.disconnect();
        } catch (Exception e) {
            log.error("Authentication failed - Unexpected error - Session ID: {}", 
                    client.getSessionId(), e);
            client.sendEvent("error", "Authentication failed: Internal server error");
            client.disconnect();
        }
    }

    public void onDisconnect(SocketIOClient client) {
        UUID branchId = client.get("branchId");
        String role = client.get("role");
        
        if (branchId != null && role != null) {
            String roomName = "branch:" + branchId + ":" + role.toLowerCase();
            client.leaveRoom(roomName);
            log.info("Client disconnected - Session ID: {}, Room: {}, Role: {}", 
                    client.getSessionId(), roomName, role);
        } else {
            log.info("Client disconnected - Session ID: {} (not authenticated)", client.getSessionId());
        }
    }

    public void onPing(SocketIOClient client) {
        client.sendEvent("pong");
    }

}
