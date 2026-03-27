package com.stored.storedsystemmanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StoreResponseDTO {
    private Long id;
    private String name;
    private String address;
    private Long sellerId;
    private String sellerName;
}
