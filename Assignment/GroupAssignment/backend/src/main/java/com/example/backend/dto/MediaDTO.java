package com.example.backend.dto;
import java.util.UUID;

import com.example.backend.entities.EntityStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaDTO {
    private UUID mediaId;
    private UUID targetId;
    private String targetTypeCode;
    private String url;
    private EntityStatus status;
}
