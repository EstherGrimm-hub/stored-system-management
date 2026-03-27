package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.store.id = :storeId AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumRevenueByStoreAndDateRange(@Param("storeId") Long storeId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Long countOrdersByStoreAndDateRange(@Param("storeId") Long storeId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Order> findTop5ByStoreIdOrderByCreatedAtDesc(Long storeId);

    // Hàm bị thiếu để lấy lịch sử
    List<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal sumRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Long countOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query(value = "SELECT CAST(created_at AS DATE) AS report_date, SUM(final_amount) AS total_revenue FROM orders WHERE store_id = :storeId AND created_at >= :startDate AND created_at <= :endDate GROUP BY CAST(created_at AS DATE) ORDER BY CAST(created_at AS DATE)", nativeQuery = true)
    List<Object[]> getRevenueByDateForStore(@Param("storeId") Long storeId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query(value = "SELECT CAST(created_at AS DATE) AS report_date, SUM(final_amount) AS total_revenue FROM orders WHERE created_at >= :startDate AND created_at <= :endDate GROUP BY CAST(created_at AS DATE) ORDER BY CAST(created_at AS DATE)", nativeQuery = true)
    List<Object[]> getRevenueByDateAll(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}