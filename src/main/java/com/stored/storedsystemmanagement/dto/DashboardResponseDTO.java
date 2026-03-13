package com.stored.storedsystemmanagement.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponseDTO {
    private Long totalOrders;           // Tổng số đơn đã bán
    private BigDecimal totalRevenue;    // Tổng doanh thu thu về
    private Long lowStockProductsCount; // Số lượng mặt hàng đang cạn kho
}