package com.stored.storedsystemmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponseDTO {
    private Long id;
    private String categoryName;
    private String description;
}