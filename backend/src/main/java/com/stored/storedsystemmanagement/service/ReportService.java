package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.repository.OrderRepository;
import com.stored.storedsystemmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // Đổi tên hàm thành getDashboardStats để khớp với Controller của bạn
    public Map<String, Object> getDashboardStats(Long storeId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        BigDecimal todayRevenue = orderRepository.sumRevenueByStoreAndDateRange(storeId, startOfDay, endOfDay);
        Long todayOrders = orderRepository.countOrdersByStoreAndDateRange(storeId, startOfDay, endOfDay);
        
        // Gọi hàm truy vấn @Query vừa tạo trong ProductRepository
        long lowStockCount = productRepository.countLowStockByStoreId(storeId);

        Map<String, Object> response = new HashMap<>();
        response.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        response.put("todayOrders", todayOrders != null ? todayOrders : 0);
        response.put("lowStockWarning", lowStockCount);
        response.put("recentOrders", orderRepository.findTop5ByStoreIdOrderByCreatedAtDesc(storeId));

        return response;
    }

    public Map<String, Object> getAdminDashboardStats() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        BigDecimal todayRevenue = orderRepository.sumRevenueByDateRange(startOfDay, endOfDay);
        Long todayOrders = orderRepository.countOrdersByDateRange(startOfDay, endOfDay);
        
        // For admin, count low stock across all stores
        long lowStockCount = productRepository.countLowStockAll();

        Map<String, Object> response = new HashMap<>();
        response.put("todayRevenue", todayRevenue != null ? todayRevenue : BigDecimal.ZERO);
        response.put("todayOrders", todayOrders != null ? todayOrders : 0);
        response.put("lowStockWarning", lowStockCount);
        // For admin, maybe get recent orders across all stores
        response.put("recentOrders", orderRepository.findTop5ByOrderByCreatedAtDesc());

        return response;
    }

    // Lấy dữ liệu biểu đồ doanh thu theo tuần (7 ngày gần nhất)
    public Map<String, Object> getRevenueChartData(Long storeId) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(6).toLocalDate().atStartOfDay();

        List<Object[]> revenueData;
        if (storeId != null) {
            revenueData = orderRepository.getRevenueByDateForStore(storeId, startDate, endDate);
        } else {
            revenueData = orderRepository.getRevenueByDateAll(startDate, endDate);
        }

        Map<String, Object> response = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();

        // Tạo danh sách 7 ngày
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            labels.add(date.format(formatter));
            data.add(BigDecimal.ZERO);
        }

        // Điền dữ liệu thực tế
        for (Object[] row : revenueData) {
            java.sql.Date sqlDate = (java.sql.Date) row[0];
            LocalDate date = sqlDate.toLocalDate();
            BigDecimal revenue = (BigDecimal) row[1];

            String dateStr = date.format(formatter);
            int index = labels.indexOf(dateStr);
            if (index >= 0) {
                data.set(index, revenue);
            }
        }

        response.put("labels", labels);
        response.put("data", data);
        return response;
    }

    // Lấy top 5 sản phẩm bán chạy
    public List<Map<String, Object>> getTopProducts(Long storeId, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<Object[]> productsData;
        if (storeId != null) {
            productsData = productRepository.findTopSellingProductsByStore(storeId, startDate, endDate);
        } else {
            productsData = productRepository.findTopSellingProductsAll(startDate, endDate);
        }

        return productsData.stream().limit(5).map(row -> {
            Map<String, Object> product = new HashMap<>();
            product.put("name", (String) row[0]);
            product.put("totalSold", (Long) row[1]);
            return product;
        }).collect(Collectors.toList());
    }

    // So sánh với kỳ trước
    public Map<String, Object> getComparisonStats(Long storeId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentPeriodStart = now.minusDays(6).toLocalDate().atStartOfDay();
        LocalDateTime currentPeriodEnd = now.toLocalDate().atTime(LocalTime.MAX);
        LocalDateTime previousPeriodStart = currentPeriodStart.minusDays(7);
        LocalDateTime previousPeriodEnd = currentPeriodStart.minusDays(1).toLocalDate().atTime(LocalTime.MAX);

        BigDecimal currentRevenue, previousRevenue;
        Long currentOrders, previousOrders;

        if (storeId != null) {
            currentRevenue = orderRepository.sumRevenueByStoreAndDateRange(storeId, currentPeriodStart, currentPeriodEnd);
            previousRevenue = orderRepository.sumRevenueByStoreAndDateRange(storeId, previousPeriodStart, previousPeriodEnd);
            currentOrders = orderRepository.countOrdersByStoreAndDateRange(storeId, currentPeriodStart, currentPeriodEnd);
            previousOrders = orderRepository.countOrdersByStoreAndDateRange(storeId, previousPeriodStart, previousPeriodEnd);
        } else {
            currentRevenue = orderRepository.sumRevenueByDateRange(currentPeriodStart, currentPeriodEnd);
            previousRevenue = orderRepository.sumRevenueByDateRange(previousPeriodStart, previousPeriodEnd);
            currentOrders = orderRepository.countOrdersByDateRange(currentPeriodStart, currentPeriodEnd);
            previousOrders = orderRepository.countOrdersByDateRange(previousPeriodStart, previousPeriodEnd);
        }

        currentRevenue = currentRevenue != null ? currentRevenue : BigDecimal.ZERO;
        previousRevenue = previousRevenue != null ? previousRevenue : BigDecimal.ZERO;
        currentOrders = currentOrders != null ? currentOrders : 0L;
        previousOrders = previousOrders != null ? previousOrders : 0L;

        Map<String, Object> response = new HashMap<>();
        response.put("currentRevenue", currentRevenue);
        response.put("previousRevenue", previousRevenue);
        response.put("currentOrders", currentOrders);
        response.put("previousOrders", previousOrders);

        // Tính phần trăm thay đổi
        double revenueChange = previousRevenue.compareTo(BigDecimal.ZERO) != 0 ?
            currentRevenue.subtract(previousRevenue).divide(previousRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        double ordersChange = previousOrders != 0 ?
            ((double)(currentOrders - previousOrders) / previousOrders) * 100 : 0.0;

        response.put("revenueChangePercent", revenueChange);
        response.put("ordersChangePercent", ordersChange);

        return response;
    }
}