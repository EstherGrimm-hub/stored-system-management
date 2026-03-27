package com.stored.storedsystemmanagement.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private String token;
    private String fullName;
    private String role;
    private Long storeId;
    private String storeName;
    private Boolean hasStore;  // Flag indicating if user (USER role) has a store
}