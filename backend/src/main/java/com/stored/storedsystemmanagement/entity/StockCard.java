package com.stored.storedsystemmanagement.entity;

import lombok.*;
import javax.persistence.*;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "transaction_type", nullable = true)
    private String transactionType; // Cột cũ tương ứng trong DB

    @Column(name = "change_type", nullable = true)
    private String changeType; // Bán, Nhập, Khởi tạo

    @Column(name = "quantity_changed", nullable = true)
    private Integer quantityChanged;

    @Column(name = "quantity_change")
    private int quantityChange;

    @Column(name = "balance", nullable = true)
    private Integer balance;

    @Column(name = "balance_quantity")
    private int balanceQuantity;

    private String referenceCode;
    private String note;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}