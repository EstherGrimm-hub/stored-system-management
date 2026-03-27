package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.store.id = :storeId")
    List<Product> findByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.id = :id AND p.store.id = :storeId")
    Optional<Product> findByIdAndStoreId(@Param("id") Long id, @Param("storeId") Long storeId);

    long countByStoreId(Long storeId);

    boolean existsBySkuAndStoreId(String sku, Long storeId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.store.id = :storeId AND p.stockQuantity <= p.minStockLevel")
    long countLowStockByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity <= p.minStockLevel")
    long countLowStockAll();

    @Query("SELECT p.productName, SUM(od.quantity) as totalSold FROM OrderDetail od JOIN od.product p JOIN od.order o WHERE o.store.id = :storeId AND o.createdAt >= :startDate AND o.createdAt <= :endDate GROUP BY p.id, p.productName ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductsByStore(@Param("storeId") Long storeId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);

    @Query("SELECT p.productName, SUM(od.quantity) as totalSold FROM OrderDetail od JOIN od.product p JOIN od.order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate GROUP BY p.id, p.productName ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductsAll(@Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate);
}