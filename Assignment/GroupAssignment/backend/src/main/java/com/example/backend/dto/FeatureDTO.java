package com.example.backend.dto;

import com.example.backend.entities.FeatureCode;
import java.util.UUID;

public class FeatureDTO {
    private UUID id;
    private String name;
    private String description;
    private FeatureCode code; // null = descriptive feature, not null = limit feature
    private boolean hasValue;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isHasValue() {
        return hasValue;
    }

    public void setHasValue(boolean hasValue) {
        this.hasValue = hasValue;
    }

    public FeatureCode getCode() {
        return code;
    }

    public void setCode(FeatureCode code) {
        this.code = code;
    }

    // Helper method to check if this is a limit feature
    public boolean isLimitFeature() {
        return code != null;
    }

    // Helper method to check if this is a descriptive feature
    public boolean isDescriptiveFeature() {
        return code == null;
    }
}