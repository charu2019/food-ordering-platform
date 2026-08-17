package com.foodordering.dto.auth;

import java.util.UUID;

import com.foodordering.model.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
// Auth Response DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UUID userId;
    private String name;
    private String email;
    private UserRole role;
}