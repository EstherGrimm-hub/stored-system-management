package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.ProductRequestDTO;
import com.stored.storedsystemmanagement.dto.ProductResponseDTO;
import com.stored.storedsystemmanagement.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@Valid @RequestBody ProductRequestDTO requestDTO) {
        ProductResponseDTO response = productService.createProduct(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        List<ProductResponseDTO> response = productService.getAllProducts();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // API Cập nhật Sản phẩm (Sử dụng phương thức PUT)
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductRequestDTO requestDTO) {
        
        ProductResponseDTO response = productService.updateProduct(id, requestDTO);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // API Xóa Sản phẩm (Sử dụng phương thức DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return new ResponseEntity<>("Đã xóa sản phẩm thành công!", HttpStatus.OK);
    }
}