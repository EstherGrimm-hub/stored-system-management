package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.ProductRequestDTO;
import com.stored.storedsystemmanagement.dto.ProductResponseDTO;
import com.stored.storedsystemmanagement.entity.Product;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.UserRepository;
import com.stored.storedsystemmanagement.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    // Hàm tiện ích để lấy User và kiểm tra Cửa hàng
    private User getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (user.getStore() == null) {
            throw new RuntimeException("Tài khoản chưa được gắn với cửa hàng nào!");
        }
        return user;
    }

    // API: Lấy danh sách hàng hóa của cửa hàng
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getProducts(Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(productService.getAllProductsByStore(user.getStore().getId()));
    }

    // API: Lấy chi tiết 1 sản phẩm
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id, Principal principal) {
        User user = getCurrentUser(principal);
        Product product = productService.getProductByIdAndStore(id, user.getStore().getId());
        return ResponseEntity.ok(product);
    }

    // API: Thêm mới hàng hóa
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequestDTO req, Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(productService.createProduct(req, user.getStore().getId()));
    }

    // API: Cập nhật hàng hóa
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequestDTO req, Principal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(productService.updateProduct(id, req, user.getStore().getId()));
    }

    // API: Xóa hàng hóa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Principal principal) {
        User user = getCurrentUser(principal);
        productService.deleteProduct(id, user.getStore().getId());
        return ResponseEntity.noContent().build();
    }
}