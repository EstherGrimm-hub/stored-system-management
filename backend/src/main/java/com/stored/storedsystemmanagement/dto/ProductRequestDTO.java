package com.stored.storedsystemmanagement.dto;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequestDTO {

    @NotBlank(message = "Mã SKU không được để trống")
    private String sku;

    private String barcode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    @NotNull(message = "Giá vốn không được để trống")
    @Min(value = 0, message = "Giá vốn phải >= 0")
    private BigDecimal costPrice;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán phải >= 0")
    private BigDecimal sellingPrice;

    @NotNull(message = "Số lượng tồn kho không được để trống")
    @Min(value = 0, message = "Tồn kho phải >= 0")
    private Integer stockQuantity;

    @NotNull(message = "Mức cảnh báo tồn kho không được để trống")
    @Min(value = 0, message = "Mức cảnh báo phải >= 0")
    private Integer minStockLevel;

    @NotNull(message = "ID Danh mục không được để trống")
    private Long categoryId; // Chỉ nhận ID của danh mục thay vì cả object
}