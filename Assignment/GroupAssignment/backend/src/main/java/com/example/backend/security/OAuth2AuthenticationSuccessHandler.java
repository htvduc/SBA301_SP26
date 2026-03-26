package com.example.backend.security;

import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.GoogleAccount;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.TokenMapper;
import com.example.backend.repositories.GoogleAccountRepository;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final GoogleAccountRepository googleAccountRepository;
    private final RoleRepository roleRepository;
    private final TokenMapper tokenMapper;

    @Value("${frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        log.info("OAuth2 authentication successful");

        if (authentication instanceof OAuth2AuthenticationToken oauth2Token) {
            OAuth2User oauth2User = oauth2Token.getPrincipal();

            // Extract user info from OAuth2User
            String googleSub = oauth2User.getAttribute("sub");
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            Boolean emailVerified = oauth2User.getAttribute("email_verified");

            log.info("Processing OAuth2 user: email={}, sub={}", email, googleSub);

            // Verify email
            if (emailVerified == null || !emailVerified) {
                log.error("Email not verified for: {}", email);
                redirectToErrorPage(response, "Email not verified");
                return;
            }

            // Find or create user
            User user = findOrCreateUser(googleSub, email, name);

            // Extract client info
            String clientIp = extractClientIp(request);
            String userAgent = extractUserAgent(request);

            // Generate JWT tokens
            AuthenticationResponse authResponse = tokenMapper.mapToJwtTokens(user, clientIp, userAgent);

            // Set tokens in HttpOnly cookies
            setAuthCookies(request, response, authResponse);

            // Redirect to frontend root
            String targetUrl = frontendBaseUrl + "/";
            log.info("Redirecting to: {}", targetUrl);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);

        } else {
            log.error("Unexpected authentication type: {}", authentication.getClass().getName());
            redirectToErrorPage(response, "Authentication failed");
        }
    }

    private User findOrCreateUser(String googleSub, String email, String name) {
        log.info("Finding or creating user for Google sub: {}", googleSub);

        // Check if GoogleAccount exists
        Optional<GoogleAccount> existingGoogleAccount = googleAccountRepository.findByGoogleSub(googleSub);

        if (existingGoogleAccount.isPresent()) {
            log.info("Found existing Google account for sub: {}", googleSub);
            return existingGoogleAccount.get().getUser();
        }

        // Check if User with email exists
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            log.info("Found existing user with email: {}, linking Google account", email);
            user = existingUser.get();
        } else {
            log.info("Creating new user for email: {}", email);

            Role restaurantOwnerRole = roleRepository.findByName(RoleName.RESTAURANT_OWNER)
                    .orElseThrow(() -> new AppException(ErrorCode.UNEXPECTED_EXCEPTION));

            user = new User();
            user.setEmail(email);
            user.setUsername(name);
            user.setPassword(""); // No password for OAuth users
            user.setRole(restaurantOwnerRole);
            user.setStatus(EntityStatus.ACTIVE);

            user = userRepository.save(user);
            log.info("Created new user with ID: {}", user.getUserId());
        }

        // Create GoogleAccount mapping
        GoogleAccount googleAccount = new GoogleAccount(googleSub, googleSub, user);
        googleAccountRepository.save(googleAccount);
        log.info("Created Google account mapping for user: {}", user.getEmail());

        return user;
    }

    private void setAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationResponse authResponse) {

        boolean isProduction = !request.getServerName().equals("localhost");

        // Access token cookie
        Cookie accessTokenCookie = new Cookie("access_token", authResponse.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(isProduction);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(3600);
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        // Refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refresh_token", authResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(isProduction);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(604800);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        log.info("Set authentication cookies successfully. Production: {}", isProduction);
    }

    private void redirectToErrorPage(HttpServletResponse response, String errorMessage) throws IOException {
        String errorUrl = frontendBaseUrl + "/login?error=" + errorMessage;
        response.sendRedirect(errorUrl);
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
