package com.example.Assigment2.repository;

import com.example.Assigment2.pojos.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Short> {
    // Lọc các Category đang hoạt động
    List<Category> findByIsActive(Integer isActive);

    // Search: Tìm theo tên hoặc mô tả (case-insensitive)
    List<Category> findByCategoryNameContainingIgnoreCaseOrCategoryDescriptionContainingIgnoreCase(
            String categoryName, String categoryDescription);

    // Tìm kiếm tổng quát (dùng cho search API với query parameter)
    @Query("SELECT c FROM Category c WHERE " +
            "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.categoryDescription) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Category> searchCategories(@Param("query") String query);

    // Kiểm tra xem category có được sử dụng trong NewsArticle không (để check can-delete)
    @Query("SELECT COUNT(n) > 0 FROM NewsArticle n WHERE n.category.categoryId = :categoryId")
    boolean existsInNewsArticles(@Param("categoryId") Short categoryId);
}
