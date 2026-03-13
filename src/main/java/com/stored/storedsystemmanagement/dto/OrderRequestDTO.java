package com.stored.storedsystemmanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequestDTO {
    
    @Min(value = 0, message = "Tiền giảm giá không được âm")
    private BigDecimal discountAmount;

    @NotNull(message = "Tiền khách đưa không được để trống")
    @Min(value = 0, message = "Tiền khách đưa không được âm")
    private BigDecimal customerTendered;

    @NotEmpty(message = "Giỏ hàng không được để trống")
    @Valid // Kích hoạt kiểm tra lỗi cho từng món hàng bên trong List
    private List<OrderDetailRequestDTO> items;
}