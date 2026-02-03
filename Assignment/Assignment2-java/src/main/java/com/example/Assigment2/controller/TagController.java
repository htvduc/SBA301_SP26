package com.example.Assigment2.controller;

import com.example.Assigment2.pojos.Tag;
import com.example.Assigment2.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping
    public ResponseEntity<List<Tag>> getAll() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tag> getById(@PathVariable Integer id) {
        return tagService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Tag tag) {
        // Validation
        if (tag.getTagName() == null || tag.getTagName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tag name is required"));
        }

        // Check duplicate tag name
        if (tagService.tagNameExists(tag.getTagName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Tag name already exists"));
        }

        Tag saved = tagService.saveTag(tag);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Tag tag) {
        if (!tagService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // Validation
        if (tag.getTagName() == null || tag.getTagName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Tag name is required"));
        }

        // Check duplicate tag name (excluding current tag)
        if (tagService.tagNameExistsExcluding(tag.getTagName(), id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Tag name already exists"));
        }

        tag.setTagId(id);
        Tag updated = tagService.saveTag(tag);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!tagService.getById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        tagService.deleteTag(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Tag>> search(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(tagService.getAllTags());
        }
        return ResponseEntity.ok(tagService.searchTags(query));
    }
}
