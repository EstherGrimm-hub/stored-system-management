package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.CategoryRequestDTO;
import com.stored.storedsystemmanagement.dto.CategoryResponseDTO;
import com.stored.storedsystemmanagement.entity.Category;
import com.stored.storedsystemmanagement.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        // 1. Kiểm tra trùng lặp tên danh mục
        if (categoryRepository.existsByCategoryName(requestDTO.getCategoryName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        // 2. Chuyển DTO thành Entity để lưu
        Category category = Category.builder()
                .categoryName(requestDTO.getCategoryName())
                .description(requestDTO.getDescription())
                .build();

        // 3. Lưu vào Database
        Category savedCategory = categoryRepository.save(category);

        // 4. Trả về kết quả cho Front-end
        return CategoryResponseDTO.builder()
                .id(savedCategory.getId())
                .categoryName(savedCategory.getCategoryName())
                .description(savedCategory.getDescription())
                .build();
    }
}