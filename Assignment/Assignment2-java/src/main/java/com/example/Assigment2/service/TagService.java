package com.example.Assigment2.service;

import com.example.Assigment2.pojos.Tag;
import com.example.Assigment2.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepo;

    // Lấy tất cả tags
    public List<Tag> getAllTags() {
        return tagRepo.findAll();
    }

    // Lấy tag theo ID
    public Optional<Tag> getById(Integer id) {
        return tagRepo.findById(id);
    }

    // Search tags: Tìm kiếm theo tên tag hoặc note
    public List<Tag> searchTags(String query) {
        if (query == null || query.trim().isEmpty()) {
            return tagRepo.findAll();
        }
        return tagRepo.searchTags(query.trim());
    }

    // Tạo mới hoặc cập nhật tag
    public Tag saveTag(Tag tag) {
        return tagRepo.save(tag);
    }

    // Xóa tag
    public void deleteTag(Integer id) {
        tagRepo.deleteById(id);
    }

    // Kiểm tra tag name đã tồn tại chưa (để validate khi tạo mới)
    public boolean tagNameExists(String tagName) {
        return tagRepo.findByTagNameIgnoreCase(tagName).isPresent();
    }

    // Kiểm tra tag name đã tồn tại chưa (trừ tag hiện tại - dùng khi update)
    public boolean tagNameExistsExcluding(String tagName, Integer excludeTagId) {
        Optional<Tag> existingTag = tagRepo.findByTagNameIgnoreCase(tagName);
        if (existingTag.isPresent()) {
            // Nếu tìm thấy tag và không phải chính tag đang update
            return !existingTag.get().getTagId().equals(excludeTagId);
        }
        return false;
    }
}
