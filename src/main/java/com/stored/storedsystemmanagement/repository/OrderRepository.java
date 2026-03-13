package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Đếm tổng số đơn hàng đã hoàn thành
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED'")
    Long countCompletedOrders();

    // Tính tổng doanh thu (Cộng dồn cột finalAmount)
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();
}