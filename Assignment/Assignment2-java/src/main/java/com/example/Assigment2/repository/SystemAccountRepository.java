package com.example.Assigment2.repository;

import com.example.Assigment2.pojos.SystemAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemAccountRepository extends JpaRepository<SystemAccount, Integer> {
    // Tìm kiếm bằng Email để làm chức năng Login
    Optional<SystemAccount> findByAccountEmail(String email);

    // Tìm kiếm bằng AccountName để làm chức năng Login (có thể login bằng email hoặc username)
    Optional<SystemAccount> findByAccountName(String accountName);

    // Tìm kiếm bằng Email HOẶC AccountName (dùng cho login)
    Optional<SystemAccount> findByAccountEmailOrAccountName(String email, String accountName);

    // Search: Tìm theo tên hoặc email (case-insensitive)
    List<SystemAccount> findByAccountNameContainingIgnoreCaseOrAccountEmailContainingIgnoreCase(
            String accountName, String accountEmail);

    // Search tổng quát (dùng cho search API với query parameter)
    @Query("SELECT a FROM SystemAccount a WHERE " +
            "LOWER(a.accountName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(a.accountEmail) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<SystemAccount> searchAccounts(@Param("query") String query);

    // Kiểm tra xem account có tạo NewsArticle không (để check can-delete)
    @Query("SELECT COUNT(n) > 0 FROM NewsArticle n WHERE n.createdBy.accountId = :accountId")
    boolean hasCreatedNewsArticles(@Param("accountId") Integer accountId);
}
