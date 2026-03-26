package com.example.backend.mapper;

import org.springframework.stereotype.Component;

import com.example.backend.dto.AreaDTO;
import com.example.backend.entities.Area;

@Component
public class AreaMapper {

    public AreaDTO toDto(Area entity) {
        if (entity == null) {
            return null;
        }

        AreaDTO dto = new AreaDTO();
        dto.setAreaId(entity.getAreaId());
        dto.setBranchId(entity.getBranch() != null ? entity.getBranch().getBranchId() : null);
        dto.setBranchName(entity.getBranch() != null ? entity.getBranch().getAddress() : null);
        dto.setName(entity.getName());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        // Fix: Use getAreas() which actually returns AreaTable entities (tables in this area)
        dto.setTableCount(entity.getAreas() != null ? entity.getAreas().size() : 0);

        return dto;
    }

    public Area toEntity(AreaDTO dto) {
        if (dto == null) {
            return null;
        }

        Area entity = new Area();
        entity.setAreaId(dto.getAreaId());
        entity.setName(dto.getName());
        entity.setStatus(dto.getStatus());

        return entity;
    }

    public void updateEntityFromDto(AreaDTO dto, Area entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
    }
}
