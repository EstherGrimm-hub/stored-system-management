package com.stored.storedsystemmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders") // Chữ order là từ khóa nhạy cảm trong SQL nên phải thêm s
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderCode; // Mã hóa đơn (VD: HD0001)

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount; // Tổng tiền hàng

    @Column(precision = 18, scale = 2)
    private BigDecimal discountAmount; // Tiền giảm giá

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal finalAmount; // Tiền khách phải trả

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal customerTendered; // Tiền khách đưa

    @Column(precision = 18, scale = 2)
    private BigDecimal changeAmount; // Tiền thối lại

    @Column(nullable = false)
    private String status; // Trạng thái: COMPLETED, CANCELLED...

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 1 Hóa đơn có nhiều Chi tiết hóa đơn
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderDetail> orderDetails;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}