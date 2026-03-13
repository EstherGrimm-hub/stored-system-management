package com.stored.storedsystemmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 50)
    private String referenceCode; // Mã kham chiếu (Chính là Mã Hóa Đơn HD0001 hoặc Mã Phiếu Nhập)

    @Column(nullable = false, length = 50)
    private String transactionType; // Loại giao dịch: SELL (Bán), IMPORT (Nhập), RETURN (Trả)

    @Column(nullable = false)
    private Integer quantityChanged; // Số lượng thay đổi (Bán thì là số âm, Nhập thì là số dương)

    @Column(nullable = false)
    private Integer balance; // Tồn kho CÒN LẠI sau khi giao dịch (Rất quan trọng)

    @Column(updatable = false)
    private LocalDateTime createdAt; // Thời gian phát sinh

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}