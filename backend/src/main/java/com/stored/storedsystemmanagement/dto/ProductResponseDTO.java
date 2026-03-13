package com.stored.storedsystemmanagement.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductResponseDTO {
    private Long id;
    private String sku;
    private String barcode;
    private String productName;
    private BigDecimal sellingPrice;
    private Integer stockQuantity;
    private String categoryName;
}