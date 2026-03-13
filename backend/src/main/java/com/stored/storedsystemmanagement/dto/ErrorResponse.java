package com.stored.storedsystemmanagement.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp; // Thời gian xảy ra lỗi
    private int status;              // Mã lỗi (VD: 400, 404, 500)
    private String error;            // Tên lỗi (VD: Bad Request)
    private String message;          // Lời nhắn chi tiết (VD: "Mã SKU đã tồn tại")
}