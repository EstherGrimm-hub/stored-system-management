package com.stored.storedsystemmanagement.entity;

import javax.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku; // Mã hàng hóa nội bộ (VD: SP0001)

    @Column(unique = true, length = 50)
    private String barcode; // Mã vạch để quét tít tít ở quầy POS

    @Column(nullable = false, length = 255, columnDefinition = "NVARCHAR(255)")
    private String productName;

    @Column(precision = 18, scale = 2)
    private BigDecimal costPrice; // Giá vốn (để tính lợi nhuận)

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice; // Giá bán ra

    @Column(nullable = false)
    private Integer stockQuantity; // Số lượng tồn kho hiện tại

    @Column(nullable = false)
    private Integer minStockLevel; // Mức tồn kho tối thiểu (để báo động sắp hết hàng)

    private String imageUrl; // Link ảnh sản phẩm

    @Column(updatable = false)
    private LocalDateTime createdAt; // Ngày tạo sản phẩm

    private LocalDateTime updatedAt; // Ngày cập nhật gần nhất

    // Mối quan hệ Nhiều-1: Nhiều Sản phẩm thuộc về 1 Danh mục
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true)
    @JsonIgnore
    private Category category;

    // Mỗi sản phẩm thuộc về 1 cửa hàng (branch)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    @JsonIgnore
    private Store store;

    // Tự động gán thời gian lúc mới tạo DB
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Tự động cập nhật thời gian khi sửa đổi DB
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}