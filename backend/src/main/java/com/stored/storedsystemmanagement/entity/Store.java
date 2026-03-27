package com.stored.storedsystemmanagement.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150, columnDefinition = "NVARCHAR(150)")
    private String name;

    @Column(length = 500, columnDefinition = "NVARCHAR(500)")
    private String address;

    /**
     * Chủ cửa hàng (SELLER). Nếu store do admin tạo thì seller có thể là null.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = true)
    @JsonIgnore
    private User seller;

    /**
     * Danh sách sản phẩm của store này
     */
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;

    /**
     * Danh sách đơn hàng của store này
     */
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;}