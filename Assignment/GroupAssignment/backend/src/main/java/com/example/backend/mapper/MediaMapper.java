package com.example.backend.mapper;

import com.example.backend.dto.MediaDTO;
import com.example.backend.entities.Media;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MediaMapper {

    @Mapping(source = "targetType.code", target = "targetTypeCode")
    MediaDTO toMediaDTO(Media media);

    @Mapping(target = "targetType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Media toMedia(MediaDTO dto);
}