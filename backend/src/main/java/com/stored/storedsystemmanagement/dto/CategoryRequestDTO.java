package com.stored.storedsystemmanagement.dto;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequestDTO {
    
    @NotBlank(message = "Tên danh mục không được để trống")
    private String categoryName;

    private String description;
}
