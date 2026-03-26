package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.LogoutRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.request.StaffLoginRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.StaffAuthResponse;
import com.example.backend.services.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final com.example.backend.repositories.UserRepository userRepository;
    private final com.example.backend.repositories.StaffAccountRepository staffAccountRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Login request received for email: {}", request.getEmail());

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        AuthenticationResponse authResponse = authenticationService.login(request, clientIp, userAgent);

        // Set JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());

        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Login successful");
        response.setResult(authResponse);

        log.info("Login successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/staff-login")
    public ResponseEntity<ApiResponse<StaffAuthResponse>> staffLogin(
            @Valid @RequestBody StaffLoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Staff Login request received for username: {}", request.getUsername());

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        StaffAuthResponse authResponse = authenticationService.staffLogin(request, clientIp, userAgent);

        // Set JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());

        ApiResponse<StaffAuthResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Staff login successful");
        response.setResult(authResponse);

        log.info("Staff Login successful for username: {}", request.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(
            @Valid @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Refresh token request received");

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        // Get refresh token from request body or cookie
        String refreshToken = getRefreshTokenFromRequestOrCookie(request, httpRequest);

        if (refreshToken == null) {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshRequest refreshRequest = new RefreshRequest();
        refreshRequest.setRefreshToken(refreshToken);

        AuthenticationResponse authResponse = authenticationService.refreshToken(refreshRequest, clientIp, userAgent);

        // Set new JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());

        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Token refreshed successfully");
        response.setResult(authResponse);

        log.info("Token refresh successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/staff-refresh")
    public ResponseEntity<ApiResponse<StaffAuthResponse>> staffRefresh(
            @Valid @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Staff refresh token request received");

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        String refreshToken = getRefreshTokenFromRequestOrCookie(request, httpRequest);

        if (refreshToken == null) {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshRequest refreshRequest = new RefreshRequest();
        refreshRequest.setRefreshToken(refreshToken);

        StaffAuthResponse authResponse = authenticationService.staffRefreshToken(refreshRequest, clientIp, userAgent);

        // Set new JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse.getAccessToken(), authResponse.getRefreshToken());

        ApiResponse<StaffAuthResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Staff token refreshed successfully");
        response.setResult(authResponse);

        log.info("Staff token refresh successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody(required = false) LogoutRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Logout request received");

        // Get refresh token from request body or cookie
        String refreshToken = null;
        if (request != null && request.getRefreshToken() != null) {
            refreshToken = request.getRefreshToken();
        } else {
            refreshToken = getTokenFromCookie(httpRequest, "refresh_token");
        }

        if (refreshToken != null) {
            authenticationService.logout(refreshToken);
        }

        // Clear authentication cookies
        clearAuthCookies(httpRequest, httpResponse);

        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Logout successful");

        log.info("Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getCurrentUser() {
        log.info("Get current user request received");

        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.UNAUTHENTICATED);
        }

        Object principal = authentication.getPrincipal();
        com.example.backend.dto.response.UserResponse userDTO = null;
        StaffAuthResponse.StaffInfo staffInfo = null;

        if (principal instanceof com.example.backend.entities.StaffAccount staff) {
            // Reload staff with role/branch/restaurant eagerly to avoid detached lazy proxies
            com.example.backend.entities.StaffAccount   loadedStaff = staffAccountRepository
                    .findByIdWithRoleBranchAndRestaurant(staff.getStaffAccountId())
                    .orElseThrow(() -> new com.example.backend.exception.AppException(
                            com.example.backend.exception.ErrorCode.USER_NOT_FOUND));

            staffInfo = new StaffAuthResponse.StaffInfo(
                    loadedStaff.getStaffAccountId(),
                    loadedStaff.getUsername(),
                    loadedStaff.getRole().getName().name(),
                    loadedStaff.getBranch().getBranchId(),
                    loadedStaff.getBranch().getRestaurant().getRestaurantId()
            );
        } else if (principal instanceof com.example.backend.entities.User userFromContext) {
            // Regular user — reload từ DB để đảm bảo role được load trong transaction
            com.example.backend.entities.User user = userRepository
                    .findById(userFromContext.getUserId())
                    .orElseThrow(() -> new com.example.backend.exception.AppException(
                            com.example.backend.exception.ErrorCode.USER_NOT_FOUND));
            userDTO = new com.example.backend.dto.response.UserResponse(
                    user.getUserId(),
                    user.getEmail(),
                    user.getUsername(),
                    user.getRole().getName().name());
        } else {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.UNAUTHENTICATED);
        }

        // Tạo một map hoặc object chung để trả về
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        if (userDTO != null) result.put("user", userDTO);
        if (staffInfo != null) result.put("staffInfo", staffInfo);

        ApiResponse<java.util.Map<String, Object>> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("User retrieved successfully");
        response.setResult(result);

        log.info("Current user retrieved successfully");
        return ResponseEntity.ok(response);
    }

    // Helper methods

    private void setAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response,
            String accessToken,
            String refreshToken) {

        boolean isProduction = request.isSecure() ||
                "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        // Access token cookie
        Cookie accessTokenCookie = new Cookie("access_token", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(isProduction);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(3600); // 1 hour
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        // Refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refresh_token", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(isProduction);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(604800); // 7 days
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        log.info("Set authentication cookies successfully. Production: {}", isProduction);
    }

    private void clearAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response) {

        boolean isProduction = request.isSecure() ||
                "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        Cookie accessTokenCookie = new Cookie("access_token", null);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(isProduction);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(isProduction);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        log.info("Cleared authentication cookies. Production: {}", isProduction);
    }

    private String getRefreshTokenFromRequestOrCookie(RefreshRequest request, HttpServletRequest httpRequest) {
        if (request != null && request.getRefreshToken() != null) {
            return request.getRefreshToken();
        }
        return getTokenFromCookie(httpRequest, "refresh_token");
    }

    private String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getHeader("X-Real-IP");
        }
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        if (clientIp != null && clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }
        return clientIp;
    }

    private String extractUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}
