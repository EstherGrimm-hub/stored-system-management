package com.stored.storedsystemmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity; // Số lượng mua

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice; // Giá bán TẠI THỜI ĐIỂM MUA

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal subTotal; // Thành tiền (quantity * unitPrice)
}