package com.example.Assigment2.repository;

import com.example.Assigment2.pojos.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Integer> {

    // Search: Tìm theo tên tag hoặc note (case-insensitive)
    List<Tag> findByTagNameContainingIgnoreCaseOrNoteContainingIgnoreCase(
            String tagName, String note);

    // Search tổng quát (dùng cho search API với query parameter)
    @Query("SELECT t FROM Tag t WHERE " +
            "LOWER(t.tagName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.note) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Tag> searchTags(@Param("query") String query);

    // Tìm tag theo tên chính xác (để check duplicate)
    Optional<Tag> findByTagNameIgnoreCase(String tagName);
}
