package com.example.backend.mapper;

import org.springframework.stereotype.Component;

import com.example.backend.dto.AreaTableDTO;
import com.example.backend.entities.AreaTable;

@Component
public class AreaTableMapper {

    public AreaTableDTO toDto(AreaTable entity) {
        if (entity == null) {
            return null;
        }

        AreaTableDTO dto = new AreaTableDTO();
        dto.setAreaTableId(entity.getAreaTableId());
        dto.setAreaId(entity.getArea() != null ? entity.getArea().getAreaId() : null);
        dto.setAreaName(entity.getArea() != null ? entity.getArea().getName() : null);
        dto.setTag(entity.getTag());
        dto.setCapacity(entity.getCapacity());
        dto.setStatus(entity.getStatus());
        dto.setQr(entity.getQr());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }

    public AreaTable toEntity(AreaTableDTO dto) {
        if (dto == null) {
            return null;
        }

        AreaTable entity = new AreaTable();
        entity.setAreaTableId(dto.getAreaTableId());
        entity.setTag(dto.getTag());
        entity.setCapacity(dto.getCapacity());
        entity.setStatus(dto.getStatus());
        entity.setQr(dto.getQr());

        return entity;
    }

    public void updateEntityFromDto(AreaTableDTO dto, AreaTable entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.getTag() != null) {
            entity.setTag(dto.getTag());
        }
        if (dto.getCapacity() != null) {
            entity.setCapacity(dto.getCapacity());
        }
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        if (dto.getQr() != null) {
            entity.setQr(dto.getQr());
        }
    }
}
