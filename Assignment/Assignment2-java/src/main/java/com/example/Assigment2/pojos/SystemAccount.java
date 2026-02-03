package com.example.Assigment2.pojos;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Entity
@Table(name = "SystemAccount")
public class SystemAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("accountID")
    private Integer accountId;

    private String accountName;
    private String accountEmail;

    @JsonIgnore // Không trả về password trong API response (bảo mật)
    private String accountPassword;

    private Integer accountRole; // 1: Admin, 2: Staff

    // Một tài khoản có thể tạo nhiều bài viết
    @OneToMany(mappedBy = "createdBy")
    @JsonIgnore
    private List<NewsArticle> newsArticles;

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountEmail() {
        return accountEmail;
    }

    public void setAccountEmail(String accountEmail) {
        this.accountEmail = accountEmail;
    }

    public String getAccountPassword() {
        return accountPassword;
    }

    public void setAccountPassword(String accountPassword) {
        this.accountPassword = accountPassword;
    }

    public Integer getAccountRole() {
        return accountRole;
    }

    public void setAccountRole(Integer accountRole) {
        this.accountRole = accountRole;
    }

    @JsonIgnore
    public List<NewsArticle> getNewsArticles() {
        return newsArticles;
    }

    public void setNewsArticles(List<NewsArticle> newsArticles) {
        this.newsArticles = newsArticles;
    }
}
