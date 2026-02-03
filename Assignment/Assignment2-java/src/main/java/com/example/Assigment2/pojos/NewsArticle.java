package com.example.Assigment2.pojos;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Entity
@Table(name = "NewsArticle")
public class NewsArticle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("newsArticleID")
    private Integer newsArticleId;

    private String newsTitle;
    private String headline;
    private LocalDateTime createdDate;

    @Column(columnDefinition = "NVARCHAR(MAX)") // Để lưu nội dung dài và có dấu
    private String newsContent;

    private String newsSource;
    private Integer newsStatus; // 1: Published, 0: Draft
    private LocalDateTime modifiedDate;

    // Quan hệ N-1: Nhiều bài báo thuộc về 1 Category
    @ManyToOne
    @JoinColumn(name = "CategoryID")
    @JsonIgnore
    private Category category;

    // Quan hệ N-1: Nhiều bài báo được tạo bởi 1 Account
    @ManyToOne
    @JoinColumn(name = "CreatedByID")
    @JsonIgnore
    private SystemAccount createdBy;

    // Quan hệ N-1: Nhiều bài báo được cập nhật bởi 1 Account
    @ManyToOne
    @JoinColumn(name = "UpdatedByID")
    @JsonIgnore
    private SystemAccount updatedBy;

    // Quan hệ N-N: Nhiều bài báo có nhiều Tag (tự tạo bảng trung gian NewsTag)
    @ManyToMany
    @JoinTable(
            name = "NewsTag",
            joinColumns = @JoinColumn(name = "NewsArticleID"),
            inverseJoinColumns = @JoinColumn(name = "TagID")
    )
    @JsonIgnore
    private List<Tag> tags;

    // Getter/Setter cho newsArticleId
    public Integer getNewsArticleId() {
        return newsArticleId;
    }

    public void setNewsArticleId(Integer newsArticleId) {
        this.newsArticleId = newsArticleId;
    }

    public String getNewsTitle() {
        return newsTitle;
    }

    public void setNewsTitle(String newsTitle) {
        this.newsTitle = newsTitle;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getNewsContent() {
        return newsContent;
    }

    public void setNewsContent(String newsContent) {
        this.newsContent = newsContent;
    }

    public String getNewsSource() {
        return newsSource;
    }

    public void setNewsSource(String newsSource) {
        this.newsSource = newsSource;
    }

    public Integer getNewsStatus() {
        return newsStatus;
    }

    public void setNewsStatus(Integer newsStatus) {
        this.newsStatus = newsStatus;
    }

    public LocalDateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    // Helper methods cho frontend - trả về IDs thay vì objects
    @JsonProperty("categoryID")
    public Integer getCategoryID() {
        return category != null ? category.getCategoryId().intValue() : null;
    }

    public void setCategoryID(Integer categoryID) {
        if (categoryID != null) {
            Category cat = new Category();
            cat.setCategoryId(categoryID.shortValue());
            this.category = cat;
        } else {
            this.category = null;
        }
    }

    @JsonProperty("createdByID")
    public Integer getCreatedByID() {
        return createdBy != null ? createdBy.getAccountId() : null;
    }

    public void setCreatedByID(Integer createdByID) {
        if (createdByID != null) {
            SystemAccount account = new SystemAccount();
            account.setAccountId(createdByID);
            this.createdBy = account;
        } else {
            this.createdBy = null;
        }
    }

    @JsonProperty("updatedByID")
    public Integer getUpdatedByID() {
        return updatedBy != null ? updatedBy.getAccountId() : null;
    }

    public void setUpdatedByID(Integer updatedByID) {
        if (updatedByID != null) {
            SystemAccount account = new SystemAccount();
            account.setAccountId(updatedByID);
            this.updatedBy = account;
        } else {
            this.updatedBy = null;
        }
    }

    // Field tạm để lưu tagIDs từ frontend (không persist vào database)
    @Transient
    @JsonProperty("tagIDs")
    private List<Integer> tagIDs;

    @JsonProperty("tagIDs")
    public List<Integer> getTagIDs() {
        // Nếu đã có tags (từ database), trả về từ tags
        if (tags != null && !tags.isEmpty()) {
            return tags.stream()
                    .map(Tag::getTagId)
                    .collect(Collectors.toList());
        }
        // Nếu không có tags nhưng có tagIDs (từ frontend), trả về tagIDs
        return tagIDs;
    }

    public void setTagIDs(List<Integer> tagIDs) {
        // Lưu tagIDs vào field tạm để Service có thể đọc
        this.tagIDs = tagIDs;
        // Logic load Tag entities sẽ được xử lý trong Service layer
        // Service sẽ gọi setTags() với List<Tag> đã load từ database
    }

    // Getter/Setter cho JPA relationships (dùng trong backend)
    @JsonIgnore
    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    @JsonIgnore
    public SystemAccount getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(SystemAccount createdBy) {
        this.createdBy = createdBy;
    }

    @JsonIgnore
    public SystemAccount getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(SystemAccount updatedBy) {
        this.updatedBy = updatedBy;
    }

    @JsonIgnore
    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}
