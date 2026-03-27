package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.CategoryRequestDTO;
import com.stored.storedsystemmanagement.dto.CategoryResponseDTO;
import com.stored.storedsystemmanagement.entity.Category;
import com.stored.storedsystemmanagement.entity.Store;
import com.stored.storedsystemmanagement.repository.CategoryRepository;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final StoreRepository storeRepository;

    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Cửa hàng không hợp lệ"));

        // 1. Kiểm tra trùng lặp tên danh mục trong cùng cửa hàng
        if (categoryRepository.existsByCategoryNameAndStoreId(requestDTO.getCategoryName(), storeId)) {
            throw new RuntimeException("Tên danh mục đã tồn tại trong cửa hàng!");
        }

        // 2. Chuyển DTO thành Entity để lưu
        Category category = Category.builder()
                .categoryName(requestDTO.getCategoryName())
                .description(requestDTO.getDescription())
                .store(store)
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

    public List<CategoryResponseDTO> getAllCategories(Long storeId) {
        List<Category> categories = categoryRepository.findByStoreId(storeId);
        return categories.stream()
                .map(category -> CategoryResponseDTO.builder()
                        .id(category.getId())
                        .categoryName(category.getCategoryName())
                        .description(category.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO updateCategory(Long categoryId, CategoryRequestDTO requestDTO, Long storeId) {
        Category existing = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tìm thấy"));

        // Kiểm tra danh mục thuộc về store hiện tại (nếu có store)
        if (existing.getStore() != null && !existing.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Danh mục không thuộc về cửa hàng này");
        }

        // Kiểm tra trùng tên trong cùng store (trừ chính nó)
        if (categoryRepository.existsByCategoryNameAndStoreId(requestDTO.getCategoryName(), storeId) &&
            !existing.getCategoryName().equals(requestDTO.getCategoryName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại trong cửa hàng!");
        }

        existing.setCategoryName(requestDTO.getCategoryName());
        existing.setDescription(requestDTO.getDescription());

        Category saved = categoryRepository.save(existing);
        return CategoryResponseDTO.builder()
                .id(saved.getId())
                .categoryName(saved.getCategoryName())
                .description(saved.getDescription())
                .build();
    }

    public void deleteCategory(Long categoryId, Long storeId) {
        Category existing = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tìm thấy"));

        // Kiểm tra danh mục thuộc về store hiện tại
        if (!existing.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Danh mục không thuộc về cửa hàng này");
        }

        // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
        if (!existing.getProducts().isEmpty()) {
            throw new RuntimeException("Không thể xóa danh mục đang có sản phẩm!");
        }

        categoryRepository.delete(existing);
    }
}