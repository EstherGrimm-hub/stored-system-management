package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.StockCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockCardRepository extends JpaRepository<StockCard, Long> {
}