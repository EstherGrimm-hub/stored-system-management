package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.DashboardResponseDTO;
import com.stored.storedsystemmanagement.repository.OrderRepository;
import com.stored.storedsystemmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public DashboardResponseDTO getDashboardStats() {
        // Lấy tổng số hóa đơn
        Long totalOrders = orderRepository.countCompletedOrders();
        
        // Lấy tổng doanh thu (nếu chưa bán được đơn nào thì SQL trả về null, phải check kỹ)
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Lấy số mặt hàng sắp hết
        Long lowStockCount = productRepository.countLowStockProducts();

        return DashboardResponseDTO.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .lowStockProductsCount(lowStockCount)
                .build();
    }
}