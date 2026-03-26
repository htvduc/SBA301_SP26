package com.example.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.TargetType;

public interface TargetTypeRepository extends JpaRepository<TargetType, UUID> {
    Optional<TargetType> findByCode(String code);
} 