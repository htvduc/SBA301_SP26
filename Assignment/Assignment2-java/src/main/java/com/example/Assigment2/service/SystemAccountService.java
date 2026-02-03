package com.example.Assigment2.service;

import com.example.Assigment2.pojos.SystemAccount;
import com.example.Assigment2.repository.SystemAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemAccountService {

    @Autowired
    private SystemAccountRepository accountRepo;

    // Lấy tất cả accounts
    public List<SystemAccount> getAllAccounts() {
        return accountRepo.findAll();
    }

    // Lấy account theo ID
    public Optional<SystemAccount> getById(Integer id) {
        return accountRepo.findById(id);
    }

    // Login: Tìm kiếm bằng Email HOẶC AccountName
    public SystemAccount login(String identifier, String password) {
        // Tìm account bằng email hoặc username
        Optional<SystemAccount> accountOpt = accountRepo.findByAccountEmailOrAccountName(identifier, identifier);

        if (accountOpt.isPresent()) {
            SystemAccount account = accountOpt.get();
            // Kiểm tra password
            if (account.getAccountPassword() != null && account.getAccountPassword().equals(password)) {
                return account;
            }
        }
        return null;
    }

    // Search accounts: Tìm kiếm theo tên hoặc email
    public List<SystemAccount> searchAccounts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return accountRepo.findAll();
        }
        // Sử dụng method từ repository thay vì stream (hiệu quả hơn)
        return accountRepo.searchAccounts(query.trim());
    }

    // Tạo mới hoặc cập nhật account
    public SystemAccount saveAccount(SystemAccount account) {
        return accountRepo.save(account);
    }

    // Kiểm tra có thể xóa account không
    public boolean canDeleteAccount(Integer id) {
        return !accountRepo.hasCreatedNewsArticles(id);
    }

    // Xóa account (chỉ xóa được nếu không có news articles)
    public boolean deleteAccount(Integer id) {
        if (canDeleteAccount(id)) {
            accountRepo.deleteById(id);
            return true;
        }
        return false;
    }

    // Kiểm tra email đã tồn tại chưa (để validate khi tạo mới)
    public boolean emailExists(String email) {
        return accountRepo.findByAccountEmail(email).isPresent();
    }

    // Kiểm tra username đã tồn tại chưa (để validate khi tạo mới)
    public boolean usernameExists(String username) {
        return accountRepo.findByAccountName(username).isPresent();
    }
}
