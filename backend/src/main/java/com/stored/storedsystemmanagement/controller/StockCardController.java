package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.entity.StockCard;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.StockCardRepository;
import com.stored.storedsystemmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/stock-cards")
@RequiredArgsConstructor
public class StockCardController {

    private final StockCardRepository stockCardRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // API: Xem thẻ kho của 1 sản phẩm cụ thể
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockCard>> getProductStockCard(@PathVariable Long productId, Principal principal) {
        User user = getCurrentUser(principal);
        
        List<StockCard> history = stockCardRepository
                .findByStoreIdAndProductIdOrderByCreatedAtDesc(user.getStore().getId(), productId);
                
        return ResponseEntity.ok(history);
    }
}