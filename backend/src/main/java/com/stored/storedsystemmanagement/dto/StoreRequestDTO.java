package com.stored.storedsystemmanagement.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class StoreRequestDTO {
    @NotBlank(message = "Tên cửa hàng không được để trống")
    private String name;

    private String address;

    // Nếu ADMIN tạo cửa hàng cho SELLER thì cần truyền sellerId.
    private Long sellerId;
}
