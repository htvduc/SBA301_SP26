package com.example.Assigment2.repository;

import com.example.Assigment2.pojos.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Integer> {

    // 1. Tìm tin tức đang Active (dành cho khách xem)
    List<NewsArticle> findByNewsStatus(Integer newsStatus);

    // 2. Chức năng Search: Tìm theo tiêu đề HOẶC nội dung (case-insensitive)
    List<NewsArticle> findByNewsTitleContainingIgnoreCaseOrNewsContentContainingIgnoreCase(
            String title, String content);

    // 3. Xem lịch sử: Lấy các bài báo do 1 Account cụ thể tạo ra
    List<NewsArticle> findByCreatedBy_AccountId(Integer accountId);

    // Search tổng quát (dùng cho search API với query parameter)
    @Query("SELECT n FROM NewsArticle n WHERE " +
            "LOWER(n.newsTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.headline) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.newsContent) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<NewsArticle> searchNewsArticles(@Param("query") String query);

    // Tìm theo category
    List<NewsArticle> findByCategory_CategoryId(Short categoryId);

    // Tìm theo cả status và category
    List<NewsArticle> findByNewsStatusAndCategory_CategoryId(Integer newsStatus, Short categoryId);
}
