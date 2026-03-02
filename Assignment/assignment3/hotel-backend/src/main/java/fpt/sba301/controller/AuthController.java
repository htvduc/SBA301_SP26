package fpt.sba301.controller;

import fpt.sba301.config.StaffProperties;
import fpt.sba301.dto.LoginRequest;
import fpt.sba301.dto.RegisterRequest;
import fpt.sba301.entity.Customer;
import fpt.sba301.service.CustomerService;
import fpt.sba301.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerService customerService;
    private final StaffProperties staffProperties;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        // 1. Check staff login
        if (request.getEmail().equals(staffProperties.getEmail())
                && request.getPassword().equals(staffProperties.getPassword())) {

            String token = jwtService.generateToken(request.getEmail(), "STAFF");
            return ResponseEntity.ok(token);
        }

        // 2. Check customer login
        Customer customer = customerService.login(request.getEmail(), request.getPassword());

        if (customer == null) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        String token = jwtService.generateToken(customer.getEmail(), "CUSTOMER");
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Customer customer = customerService.register(request);
            return ResponseEntity.ok(customer);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
