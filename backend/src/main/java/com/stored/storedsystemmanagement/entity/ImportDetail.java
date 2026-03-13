package com.stored.storedsystemmanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "import_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_receipt_id", nullable = false)
    private ImportReceipt importReceipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity; // Số lượng nhập thêm

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importPrice; // Giá nhập lúc này (Có thể khác costPrice mặc định)

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal subTotal; // Thành tiền = quantity * importPrice
}