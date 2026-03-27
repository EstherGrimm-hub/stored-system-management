package com.stored.storedsystemmanagement.entity;

import javax.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String categoryName; // Tên danh mục

    @Column(length = 255, columnDefinition = "NVARCHAR(255)")
    private String description; // Mô tả thêm

    // Mối quan hệ 1-Nhiều: 1 Danh mục có nhiều Sản phẩm
    // mappedBy = "category" trỏ tới tên biến 'category' trong class Product
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;

    // Mỗi danh mục thuộc về 1 cửa hàng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id")
    private Store store;
}