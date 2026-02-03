package com.example.Assigment2.service;

import com.example.Assigment2.pojos.NewsArticle;
import com.example.Assigment2.pojos.Tag;
import com.example.Assigment2.repository.NewsArticleRepository;
import com.example.Assigment2.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NewsArticleService {

    @Autowired
    private NewsArticleRepository newsRepo;

    @Autowired
    private TagRepository tagRepo;

    // Lấy tất cả tin tức
    public List<NewsArticle> getAllNews() {
        return newsRepo.findAll();
    }

    // Lấy tin tức theo ID
    public Optional<NewsArticle> getById(Integer id) {
        return newsRepo.findById(id);
    }

    // Xem tin tức công khai: Chỉ lấy các bài có trạng thái Published (1)
    public List<NewsArticle> getPublicNews() {
        return newsRepo.findByNewsStatus(1);
    }

    // Xem lịch sử tin tức do chính Staff đang đăng nhập tạo ra
    public List<NewsArticle> getNewsByCreator(Integer creatorId) {
        return newsRepo.findByCreatedBy_AccountId(creatorId);
    }

    // Chức năng tìm kiếm tin tức theo tiêu đề, headline hoặc nội dung
    public List<NewsArticle> searchNews(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return newsRepo.findAll();
        }
        return newsRepo.searchNewsArticles(keyword.trim());
    }

    // Tạo mới hoặc cập nhật bài viết (bao gồm cả quản lý Tags)
    @Transactional
    public NewsArticle saveNewsArticle(NewsArticle article) {
        // Xử lý createdDate
        if (article.getNewsArticleId() == null) {
            // Tạo mới
            article.setCreatedDate(LocalDateTime.now());
        } else {
            // Cập nhật - giữ nguyên createdDate, chỉ update modifiedDate
            Optional<NewsArticle> existing = newsRepo.findById(article.getNewsArticleId());
            if (existing.isPresent()) {
                article.setCreatedDate(existing.get().getCreatedDate());
            }
        }

        // Luôn cập nhật modifiedDate khi save
        article.setModifiedDate(LocalDateTime.now());

        // Xử lý Tags từ tagIDs (nếu có)
        if (article.getTagIDs() != null && !article.getTagIDs().isEmpty()) {
            List<Tag> tags = tagRepo.findAllById(article.getTagIDs());
            article.setTags(tags);
        } else {
            // Nếu không có tagIDs, giữ nguyên tags hiện tại (nếu đang update)
            if (article.getNewsArticleId() != null) {
                Optional<NewsArticle> existing = newsRepo.findById(article.getNewsArticleId());
                if (existing.isPresent() && existing.get().getTags() != null) {
                    article.setTags(existing.get().getTags());
                }
            }
        }

        return newsRepo.save(article);
    }

    // Xóa bài viết tin tức
    public void deleteNewsArticle(Integer id) {
        newsRepo.deleteById(id);
    }

    // Lấy tin tức theo category
    public List<NewsArticle> getNewsByCategory(Short categoryId) {
        return newsRepo.findByCategory_CategoryId(categoryId);
    }

    // Lấy tin tức theo status và category
    public List<NewsArticle> getNewsByStatusAndCategory(Integer status, Short categoryId) {
        return newsRepo.findByNewsStatusAndCategory_CategoryId(status, categoryId);
    }
}
