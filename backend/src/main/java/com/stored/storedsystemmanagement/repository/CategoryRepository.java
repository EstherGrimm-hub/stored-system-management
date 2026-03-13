package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    // Hàm này giúp kiểm tra xem tên danh mục đã tồn tại trong database chưa
    boolean existsByCategoryName(String categoryName);
}