package com.stored.storedsystemmanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ImportDetailRequestDTO {
    @NotNull(message = "ID Sản phẩm không được trống")
    private Long productId;

    @NotNull(message = "Số lượng nhập không được trống")
    @Min(value = 1, message = "Số lượng nhập ít nhất là 1")
    private Integer quantity;

    @NotNull(message = "Giá nhập không được trống")
    @Min(value = 0, message = "Giá nhập không được âm")
    private BigDecimal importPrice;
}