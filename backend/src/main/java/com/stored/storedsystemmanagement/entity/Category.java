package com.stored.storedsystemmanagement.entity;

import jakarta.persistence.*;
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

    @Column(nullable = false, unique = true, length = 100)
    private String categoryName; // Tên danh mục

    @Column(length = 255)
    private String description; // Mô tả thêm

    // Mối quan hệ 1-Nhiều: 1 Danh mục có nhiều Sản phẩm
    // mappedBy = "category" trỏ tới tên biến 'category' trong class Product
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;
}