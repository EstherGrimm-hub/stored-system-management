package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.ProductRequestDTO;
import com.stored.storedsystemmanagement.dto.ProductResponseDTO;
import com.stored.storedsystemmanagement.entity.Category;
import com.stored.storedsystemmanagement.entity.Product;
import com.stored.storedsystemmanagement.repository.CategoryRepository;
import com.stored.storedsystemmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO) {
        // 1. Kiểm tra mã SKU và Barcode xem có bị trùng không
        if (productRepository.existsBySku(requestDTO.getSku())) {
            throw new RuntimeException("Mã SKU đã tồn tại!");
        }
        if (requestDTO.getBarcode() != null && productRepository.existsByBarcode(requestDTO.getBarcode())) {
            throw new RuntimeException("Mã vạch (Barcode) đã tồn tại!");
        }

        // 2. Tìm Danh mục trong DB xem có thật không
        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục với ID: " + requestDTO.getCategoryId()));

        // 3. Chuyển DTO thành Entity
        Product product = Product.builder()
                .sku(requestDTO.getSku())
                .barcode(requestDTO.getBarcode())
                .productName(requestDTO.getProductName())
                .costPrice(requestDTO.getCostPrice())
                .sellingPrice(requestDTO.getSellingPrice())
                .stockQuantity(requestDTO.getStockQuantity())
                .minStockLevel(requestDTO.getMinStockLevel())
                .category(category) // Nhét object Category tìm được vào đây
                .build();

        // 4. Lưu xuống DB
        Product savedProduct = productRepository.save(product);

        // 5. Trả kết quả về
        return ProductResponseDTO.builder()
                .id(savedProduct.getId())
                .sku(savedProduct.getSku())
                .barcode(savedProduct.getBarcode())
                .productName(savedProduct.getProductName())
                .sellingPrice(savedProduct.getSellingPrice())
                .stockQuantity(savedProduct.getStockQuantity())
                .categoryName(category.getCategoryName()) // Lấy tên danh mục trả về
                .build();
                
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream().map(product -> 
            ProductResponseDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .productName(product.getProductName())
                .sellingPrice(product.getSellingPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryName(product.getCategory().getCategoryName())
                .build()
        ).collect(Collectors.toList());
    }
    // 1. HÀM CẬP NHẬT (SỬA GIÁ, TÊN, DANH MỤC)
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO) {
        // Tìm sản phẩm hiện tại
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));

        // Tìm danh mục mới (nếu có đổi)
        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục với ID: " + requestDTO.getCategoryId()));

        // Tiến hành cập nhật các trường được phép sửa
        product.setProductName(requestDTO.getProductName());
        product.setCostPrice(requestDTO.getCostPrice());
        product.setSellingPrice(requestDTO.getSellingPrice());
        product.setMinStockLevel(requestDTO.getMinStockLevel());
        product.setCategory(category);
        
        // Lưu ý: KHÔNG cho phép sửa sku, barcode và stockQuantity ở đây để bảo toàn dữ liệu

        Product updatedProduct = productRepository.save(product);

        return ProductResponseDTO.builder()
                .id(updatedProduct.getId())
                .sku(updatedProduct.getSku())
                .barcode(updatedProduct.getBarcode())
                .productName(updatedProduct.getProductName())
                .sellingPrice(updatedProduct.getSellingPrice())
                .stockQuantity(updatedProduct.getStockQuantity()) // Vẫn giữ nguyên tồn kho cũ
                .categoryName(category.getCategoryName())
                .build();
    }

    // 2. HÀM XÓA SẢN PHẨM (CÓ BẢO VỆ KHÓA NGOẠI)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        
        try {
            productRepository.delete(product);
        } catch (Exception e) {
            // Nếu sản phẩm đã từng được bán hoặc nhập, SQL sẽ cấm xóa. Ta bắt lỗi và báo câu tiếng Việt.
            throw new RuntimeException("LỖI: Không thể xóa sản phẩm này vì đã phát sinh giao dịch (Bán/Nhập). KiotViet khuyên dùng tính năng 'Ngừng kinh doanh' thay vì xóa cứng!");
        }
    }
}
