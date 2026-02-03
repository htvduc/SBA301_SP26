package com.example.Assigment2.controller;

import com.example.Assigment2.pojos.SystemAccount;
import com.example.Assigment2.service.SystemAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    private SystemAccountService accountService;

    @GetMapping
    public ResponseEntity<List<SystemAccount>> getAll() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemAccount> getById(@PathVariable Integer id) {
        return accountService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SystemAccount account) {
        // Validation
        if (account.getAccountName() == null || account.getAccountName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Account name is required"));
        }
        if (account.getAccountEmail() == null || account.getAccountEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Account email is required"));
        }
        if (account.getAccountPassword() == null || account.getAccountPassword().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Account password is required"));
        }

        // Check duplicate email
        if (accountService.emailExists(account.getAccountEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        // Check duplicate username
        if (accountService.usernameExists(account.getAccountName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists"));
        }

        SystemAccount saved = accountService.saveAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody SystemAccount account) {
        if (!accountService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Validation
        if (account.getAccountName() == null || account.getAccountName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Account name is required"));
        }
        if (account.getAccountEmail() == null || account.getAccountEmail().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Account email is required"));
        }

        // Check duplicate email (excluding current account)
        SystemAccount existing = accountService.getById(id).orElse(null);
        if (existing != null && !existing.getAccountEmail().equals(account.getAccountEmail())) {
            if (accountService.emailExists(account.getAccountEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already exists"));
            }
        }

        // Check duplicate username (excluding current account)
        if (existing != null && !existing.getAccountName().equals(account.getAccountName())) {
            if (accountService.usernameExists(account.getAccountName())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists"));
            }
        }

        account.setAccountId(id);
        SystemAccount updated = accountService.saveAccount(account);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!accountService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        if (accountService.deleteAccount(id)) {
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Cannot delete account with news history"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SystemAccount>> search(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(accountService.getAllAccounts());
        }
        return ResponseEntity.ok(accountService.searchAccounts(query));
    }

    @GetMapping("/{id}/can-delete")
    public ResponseEntity<Map<String, Boolean>> checkCanDelete(@PathVariable Integer id) {
        boolean canDelete = accountService.canDeleteAccount(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("canDelete", canDelete);
        return ResponseEntity.ok(response);
    }
}
