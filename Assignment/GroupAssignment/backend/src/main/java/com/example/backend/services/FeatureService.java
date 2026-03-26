package com.example.backend.services;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.FeatureMapper;
import com.example.backend.repositories.FeatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeatureService {
    private final FeatureRepository featureRepository;
    private final FeatureMapper featureMapper;

    public FeatureService(FeatureRepository featureRepository,
                          FeatureMapper featureMapper) {
        this.featureRepository = featureRepository;
        this.featureMapper = featureMapper;
    }

    public List<FeatureDTO> getAllAvailableFeatures() {
        return featureRepository.findAll()
                .stream()
                .map(featureMapper::toFeatureDto)
                .collect(Collectors.toList());
    }

    // Get only limit features (features with FeatureCode)
    public List<FeatureDTO> getLimitFeatures() {
        return featureRepository.findAll()
                .stream()
                .filter(f -> f.getCode() != null)
                .map(featureMapper::toFeatureDto)
                .collect(Collectors.toList());
    }

    // Get only descriptive features (custom features without FeatureCode)
    public List<FeatureDTO> getDescriptiveFeatures() {
        return featureRepository.findAll()
                .stream()
                .filter(f -> f.getCode() == null)
                .map(featureMapper::toFeatureDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Feature createOrFindFeature(FeatureDTO dto) {
        if (dto.getId() != null) {
            return featureRepository.findById(dto.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOTEXISTED));
        }

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new AppException(ErrorCode.FEATURE_NAME_EMPTY);
        }

        // If FeatureCode is provided, find by code (limit feature)
        if (dto.getCode() != null) {
            return featureRepository.findByCode(dto.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOTEXISTED));
        }

        // Otherwise, create or find descriptive feature by name
        return featureRepository.findByName(dto.getName().trim())
                .orElseGet(() -> {
                    Feature f = new Feature();
                    f.setName(dto.getName().trim());
                    f.setDescription(dto.getDescription());
                    f.setCode(null); // Descriptive feature has no code
                    return featureRepository.save(f);
                });
    }
}