package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.CategoryRequestDTO;
import com.stored.storedsystemmanagement.dto.CategoryResponseDTO;
import com.stored.storedsystemmanagement.service.CategoryService;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.UserRepository;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping({"/v1/categories", "/api/v1/categories"})
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
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

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO requestDTO, Principal principal) {
        User user = getCurrentUser(principal);
        CategoryResponseDTO response = categoryService.createCategory(requestDTO, user.getStore().getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories(Principal principal) {
        User user = getCurrentUser(principal);
        List<CategoryResponseDTO> categories = categoryService.getAllCategories(user.getStore().getId());
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequestDTO requestDTO, Principal principal) {
        User user = getCurrentUser(principal);
        CategoryResponseDTO response = categoryService.updateCategory(id, requestDTO, user.getStore().getId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, Principal principal) {
        User user = getCurrentUser(principal);
        categoryService.deleteCategory(id, user.getStore().getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}