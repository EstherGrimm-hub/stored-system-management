package com.stored.storedsystemmanagement.dto;
import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class RegisterRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;
    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;
    // New users register as USER role (Store Owner). Admin accounts are created separately by admin.
}