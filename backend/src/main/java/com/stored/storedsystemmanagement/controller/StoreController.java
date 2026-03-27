package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.StoreRequestDTO;
import com.stored.storedsystemmanagement.dto.StoreResponseDTO;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<StoreResponseDTO> createStore(@Valid @RequestBody StoreRequestDTO request) {
        User user = currentUser();
        StoreResponseDTO response = storeService.createStore(request, user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<StoreResponseDTO>> getStores() {
        User user = currentUser();
        List<StoreResponseDTO> response = storeService.getStoresForCurrentUser(user);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<StoreResponseDTO>> getStoresBySeller(@PathVariable Long sellerId) {
        List<StoreResponseDTO> response = storeService.getStoresBySellerId(sellerId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<StoreResponseDTO> getStoreById(@PathVariable Long storeId) {
        StoreResponseDTO response = storeService.getStoreById(storeId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{storeId}")
    public ResponseEntity<String> deleteStore(@PathVariable Long storeId) {
        storeService.deleteStore(storeId);
        return new ResponseEntity<>("Store deleted successfully", HttpStatus.OK);
    }
}
