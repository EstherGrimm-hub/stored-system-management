package com.stored.storedsystemmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDTO {
    private Long id;
    private String productSku;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;
    private BigDecimal totalPrice;
}