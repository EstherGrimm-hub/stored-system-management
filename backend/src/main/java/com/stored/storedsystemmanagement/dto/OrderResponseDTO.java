package com.stored.storedsystemmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long id;
    private String orderCode;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal customerTendered;
    private BigDecimal changeAmount;
    private String status;
    private LocalDateTime createdAt;
    private String createdByName; // fullName của User
    private List<OrderDetailResponseDTO> orderDetails;
}