package com.stored.storedsystemmanagement.entity;

import javax.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(precision = 18, scale = 2)
    private BigDecimal discountAmount;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal finalAmount;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal customerTendered;

    @Column(precision = 18, scale = 2)
    private BigDecimal changeAmount;

    @Column(nullable = false)
    private String status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- CÁC MỐI QUAN HỆ CỐT LÕI ---

    // 1. Hóa đơn này do thu ngân nào tạo?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy; 

    // 2. Hóa đơn này thuộc cửa hàng nào? (Bắt buộc cho mô hình KiotViet)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    // 3. Chi tiết các mặt hàng đã mua
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}