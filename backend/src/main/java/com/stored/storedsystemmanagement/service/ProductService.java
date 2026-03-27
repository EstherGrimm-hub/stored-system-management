package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.ProductRequestDTO;
import com.stored.storedsystemmanagement.dto.ProductResponseDTO;
import com.stored.storedsystemmanagement.entity.Product;
import com.stored.storedsystemmanagement.entity.Category;
import com.stored.storedsystemmanagement.entity.Store;
import com.stored.storedsystemmanagement.repository.CategoryRepository;
import com.stored.storedsystemmanagement.repository.ProductRepository;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;

    public List<ProductResponseDTO> getAllProductsByStore(Long storeId) {
        List<Product> products = productRepository.findByStoreId(storeId);
        return products.stream()
                .map(product -> ProductResponseDTO.builder()
                        .id(product.getId())
                        .sku(product.getSku())
                        .barcode(product.getBarcode())
                        .productName(product.getProductName())
                        .costPrice(product.getCostPrice())
                        .sellingPrice(product.getSellingPrice())
                        .stockQuantity(product.getStockQuantity())
                        .minStockLevel(product.getMinStockLevel())
                        .imageUrl(product.getImageUrl())
                        .createdAt(product.getCreatedAt())
                        .updatedAt(product.getUpdatedAt())
                        .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                        .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public Product getProductByIdAndStore(Long productId, Long storeId) {
        return productRepository.findByIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tìm thấy"));
    }

    @Transactional
    public Product createProduct(ProductRequestDTO req, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Cửa hàng không hợp lệ"));

        // Logic tự động sinh mã SKU nếu người dùng để trống
        String finalSku = req.getSku();
        if (finalSku == null || finalSku.trim().isEmpty()) {
            long count = productRepository.countByStoreId(storeId) + 1;
            finalSku = String.format("SP%05d", count); // Sinh mã dạng SP00001
        } else {
            // Kiểm tra trùng mã SKU trong cùng 1 cửa hàng
            if (productRepository.existsBySkuAndStoreId(finalSku, storeId)) {
                throw new RuntimeException("Mã hàng hóa (SKU) đã tồn tại!");
            }
        }

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        if (category.getStore() == null || !category.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Danh mục không thuộc cửa hàng hiện tại");
        }

        Product product = Product.builder()
                .sku(finalSku)
                .barcode(req.getBarcode())
                .productName(req.getProductName())
                .costPrice(req.getCostPrice())
                .sellingPrice(req.getSellingPrice())
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .minStockLevel(req.getMinStockLevel() != null ? req.getMinStockLevel() : 5)
                .category(category)
                .store(store)
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long productId, ProductRequestDTO req, Long storeId) {
        Product existing = productRepository.findByIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tìm thấy hoặc không thuộc cửa hàng"));

        if (!existing.getSku().equals(req.getSku()) && productRepository.existsBySkuAndStoreId(req.getSku(), storeId)) {
            throw new RuntimeException("Mã hàng hóa (SKU) này đã được sử dụng trong cửa hàng");
        }

        existing.setSku(req.getSku());
        existing.setBarcode(req.getBarcode());
        existing.setProductName(req.getProductName());
        existing.setCostPrice(req.getCostPrice());
        existing.setSellingPrice(req.getSellingPrice());
        existing.setStockQuantity(req.getStockQuantity());
        existing.setMinStockLevel(req.getMinStockLevel());

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        if (category.getStore() == null || !category.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Danh mục không thuộc cửa hàng hiện tại");
        }
        existing.setCategory(category);

        return productRepository.save(existing);
    }

    @Transactional
    public void deleteProduct(Long productId, Long storeId) {
        Product existing = productRepository.findByIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tìm thấy hoặc không thuộc cửa hàng"));
        productRepository.delete(existing);
    }
}