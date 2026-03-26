package com.example.backend.mapper;

import com.example.backend.dto.PromotionDTO;
import com.example.backend.entities.Promotion;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {MenuItemMapper.class})
public interface PromotionMapper {
    PromotionDTO toPromotionDTO(Promotion promotion);
}
