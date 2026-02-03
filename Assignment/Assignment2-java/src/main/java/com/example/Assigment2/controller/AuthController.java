package com.example.Assigment2.controller;

import com.example.Assigment2.pojos.SystemAccount;
import com.example.Assigment2.service.SystemAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth") // Thêm /api prefix để match với frontend
public class AuthController {
    @Autowired
    private SystemAccountService accountService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String identifier = credentials.get("identifier"); // Frontend gửi "identifier" (email hoặc username)
        String password = credentials.get("password");

        if (identifier == null || password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Identifier and password are required"));
        }

        SystemAccount account = accountService.login(identifier, password);

        if (account != null) {
            // Tạo response với thông tin account (không có password)
            Map<String, Object> response = new HashMap<>();
            response.put("accountID", account.getAccountId());
            response.put("accountName", account.getAccountName());
            response.put("accountEmail", account.getAccountEmail());
            response.put("accountRole", account.getAccountRole());
            // TODO: Thêm JWT token nếu cần
            // response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid identifier or password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // TODO: Invalidate JWT token nếu có
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        // TODO: Implement refresh token logic
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Refresh token is required"));
        }

        // TODO: Validate và generate new access token
        return ResponseEntity.ok(Map.of("token", "new-token-here"));
    }
}
