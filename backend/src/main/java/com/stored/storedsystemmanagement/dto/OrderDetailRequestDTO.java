package com.stored.storedsystemmanagement.dto;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderDetailRequestDTO {
    @NotNull(message = "ID Sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng mua ít nhất phải là 1")
    private Integer quantity;
}