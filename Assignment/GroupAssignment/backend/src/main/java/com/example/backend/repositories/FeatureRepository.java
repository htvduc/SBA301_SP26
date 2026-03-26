package com.example.backend.repositories;

import com.example.backend.entities.Feature;
import com.example.backend.entities.FeatureCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FeatureRepository extends JpaRepository<Feature, UUID> {
    Optional<Feature> findByName(String name);
    Optional<Feature> findByCode(FeatureCode code);
}