package com.stored.storedsystemmanagement.dto;

import com.stored.storedsystemmanagement.entity.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String fullName;
    private String username;
    private RoleType role;
    private Long storeId;  // Store ID if user has a store assigned
    private String storeName;
    private Boolean hasStore;
}
