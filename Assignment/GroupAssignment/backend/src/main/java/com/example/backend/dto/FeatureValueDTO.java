package com.example.backend.dto;

import com.example.backend.entities.FeatureCode;
import java.util.UUID;

public class FeatureValueDTO {
    private UUID featureId;
    private String featureName;
    private String description;
    private FeatureCode featureCode; // To identify if this is a limit feature
    private Integer value; // Nullable: null for descriptive features, value for limit features

    public UUID getFeatureId() {
        return featureId;
    }

    public void setFeatureId(UUID featureId) {
        this.featureId = featureId;
    }

    public String getFeatureName() {
        return featureName;
    }

    public void setFeatureName(String featureName) {
        this.featureName = featureName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getValue() {
        return value;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    public FeatureCode getFeatureCode() {
        return featureCode;
    }

    public void setFeatureCode(FeatureCode featureCode) {
        this.featureCode = featureCode;
    }

    @Override
    public String toString() {
        return "FeatureValueDTO{" +
                "featureId=" + featureId +
                ", featureName='" + featureName + '\'' +
                ", description='" + description + '\'' +
                ", value=" + value +
                '}';
    }
}