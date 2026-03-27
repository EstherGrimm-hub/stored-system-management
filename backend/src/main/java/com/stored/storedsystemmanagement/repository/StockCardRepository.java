package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.StockCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockCardRepository extends JpaRepository<StockCard, Long> {
    
    // Lấy thẻ kho của 1 sản phẩm, sắp xếp mới nhất lên đầu
    List<StockCard> findByStoreIdAndProductIdOrderByCreatedAtDesc(Long storeId, Long productId);
}