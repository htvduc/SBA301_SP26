package com.example.backend.mapper;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuthenticationMapper {
    
    @Mapping(target = "role", expression = "java(user.getRole().getName().name())")
    UserResponse toUserResponse(User user);
}
