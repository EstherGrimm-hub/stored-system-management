package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findAllBySellerId(Long sellerId);
}
