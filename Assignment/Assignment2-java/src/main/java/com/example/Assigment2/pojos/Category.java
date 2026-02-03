package com.example.Assigment2.pojos;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "Category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("categoryID")
    private Short categoryId;

    private String categoryName;
    private String categoryDescription;

    @JsonProperty("isActive")
    private Integer isActive; // 1: Active, 0: Inactive

    // Tự tham chiếu: Một Category có thể có 1 Category cha
    @ManyToOne
    @JoinColumn(name = "ParentCategoryID")
    @JsonIgnore // Không serialize object này, chỉ trả về ID
    private Category parentCategory;

    // Getter/Setter cho categoryId
    public Short getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Short categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryDescription() {
        return categoryDescription;
    }

    public void setCategoryDescription(String categoryDescription) {
        this.categoryDescription = categoryDescription;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    // Helper method để trả về parentCategoryID cho frontend
    @JsonProperty("parentCategoryID")
    public Short getParentCategoryID() {
        return parentCategory != null ? parentCategory.getCategoryId() : null;
    }

    // Setter cho parentCategoryID (khi nhận từ frontend)
    public void setParentCategoryID(Short parentCategoryID) {
        if (parentCategoryID != null) {
            Category parent = new Category();
            parent.setCategoryId(parentCategoryID);
            this.parentCategory = parent;
        } else {
            this.parentCategory = null;
        }
    }

    // Getter/Setter cho parentCategory object (dùng trong JPA)
    @JsonIgnore
    public Category getParentCategory() {
        return parentCategory;
    }

    public void setParentCategory(Category parentCategory) {
        this.parentCategory = parentCategory;
    }
}
