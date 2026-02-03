package com.example.Assigment2.service;

import com.example.Assigment2.pojos.Category;
import com.example.Assigment2.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepo;

    // Lấy tất cả danh mục
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    // Lấy danh mục theo ID
    public Optional<Category> getById(Short id) {
        return categoryRepo.findById(id);
    }

    // Lấy danh mục đang active
    public List<Category> getActiveCategories() {
        return categoryRepo.findByIsActive(1);
    }

    // Search categories
    public List<Category> searchCategories(String query) {
        if (query == null || query.trim().isEmpty()) {
            return categoryRepo.findAll();
        }
        return categoryRepo.searchCategories(query.trim());
    }

    // Tạo mới hoặc cập nhật danh mục
    public Category saveCategory(Category category) {
        return categoryRepo.save(category);
    }

    // Xóa danh mục (chỉ xóa được nếu không có news articles)
    public boolean deleteCategory(Short id) {
        if (canDeleteCategory(id)) {
            categoryRepo.deleteById(id);
            return true;
        }
        return false;
    }

    // Kiểm tra có thể xóa category không
    public boolean canDeleteCategory(Short id) {
        return !categoryRepo.existsInNewsArticles(id);
    }
}
