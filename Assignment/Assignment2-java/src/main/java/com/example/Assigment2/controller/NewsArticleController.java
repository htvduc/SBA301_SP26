package com.example.Assigment2.controller;

import com.example.Assigment2.pojos.NewsArticle;
import com.example.Assigment2.service.NewsArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsArticleController {
    @Autowired
    private NewsArticleService newsService;

    @GetMapping
    public ResponseEntity<List<NewsArticle>> getAll() {
        // Trả về tất cả news (không chỉ public)
        // Nếu cần chỉ public news, dùng: newsService.getPublicNews()
        return ResponseEntity.ok(newsService.getAllNews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsArticle> getById(@PathVariable Integer id) {
        return newsService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody NewsArticle news) {
        // Validation
        if (news.getNewsTitle() == null || news.getNewsTitle().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News title is required"));
        }
        if (news.getHeadline() == null || news.getHeadline().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Headline is required"));
        }
        if (news.getNewsContent() == null || news.getNewsContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News content is required"));
        }
        if (news.getCategoryID() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Category is required"));
        }
        if (news.getCreatedByID() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Creator is required"));
        }
        if (news.getNewsStatus() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News status is required"));
        }

        NewsArticle saved = newsService.saveNewsArticle(news);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody NewsArticle news) {
        if (!newsService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Validation
        if (news.getNewsTitle() == null || news.getNewsTitle().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News title is required"));
        }
        if (news.getHeadline() == null || news.getHeadline().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Headline is required"));
        }
        if (news.getNewsContent() == null || news.getNewsContent().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News content is required"));
        }
        if (news.getCategoryID() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Category is required"));
        }
        if (news.getNewsStatus() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "News status is required"));
        }

        news.setNewsArticleId(id);
        NewsArticle updated = newsService.saveNewsArticle(news);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!newsService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        newsService.deleteNewsArticle(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<NewsArticle>> search(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(newsService.getAllNews());
        }
        return ResponseEntity.ok(newsService.searchNews(query));
    }

    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<NewsArticle>> getByCreator(@PathVariable Integer creatorId) {
        // Đã sửa: getNewsByStaff() → getNewsByCreator()
        return ResponseEntity.ok(newsService.getNewsByCreator(creatorId));
    }
}
