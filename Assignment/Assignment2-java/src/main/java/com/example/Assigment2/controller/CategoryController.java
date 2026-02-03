package com.example.Assigment2.controller;

import com.example.Assigment2.pojos.Category;
import com.example.Assigment2.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Short id) {
        return categoryService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Category category) {
        // Validation
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Category name is required"));
        }

        // Set default values
        if (category.getIsActive() == null) {
            category.setIsActive(1); // Default active
        }

        Category saved = categoryService.saveCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Short id, @RequestBody Category category) {
        if (!categoryService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Validation
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Category name is required"));
        }

        category.setCategoryId(id);
        Category updated = categoryService.saveCategory(category);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Short id) {
        if (!categoryService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        if (categoryService.deleteCategory(id)) {
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Cannot delete category that is used in news articles"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Category>> search(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(categoryService.getAllCategories());
        }
        return ResponseEntity.ok(categoryService.searchCategories(query));
    }

    @GetMapping("/{id}/can-delete")
    public ResponseEntity<Map<String, Boolean>> checkCanDelete(@PathVariable Short id) {
        boolean canDelete = categoryService.canDeleteCategory(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("canDelete", canDelete);
        return ResponseEntity.ok(response);
    }
}
