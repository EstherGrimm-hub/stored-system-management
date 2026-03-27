package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.StoreRequestDTO;
import com.stored.storedsystemmanagement.dto.StoreResponseDTO;
import com.stored.storedsystemmanagement.entity.Store;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import com.stored.storedsystemmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreResponseDTO createStore(StoreRequestDTO request, User requester) {
        // Only USER role can create stores
        if (requester.getRole() != com.stored.storedsystemmanagement.entity.RoleType.USER) {
            throw new RuntimeException("Only store owners (USER role) can create stores");
        }
        
        // Each USER can have only one store
        List<Store> existingStores = storeRepository.findAllBySellerId(requester.getId());
        if (!existingStores.isEmpty()) {
            throw new RuntimeException("User already has a store. One store per user allowed.");
        }

        Store store = Store.builder()
                .name(request.getName())
                .address(request.getAddress())
                .seller(requester)
                .build();
        Store saved = storeRepository.save(store);
        
        // Assign this store to the user
        requester.setStore(saved);
        userRepository.save(requester);

        return StoreResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .sellerId(saved.getSeller() != null ? saved.getSeller().getId() : null)
                .sellerName(saved.getSeller() != null ? saved.getSeller().getFullName() : null)
                .build();
    }

    public List<StoreResponseDTO> getStoresForCurrentUser(User requester) {
        if (requester.getRole() == com.stored.storedsystemmanagement.entity.RoleType.ADMIN) {
            // Admin can see all stores
            return storeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        }
        if (requester.getRole() == com.stored.storedsystemmanagement.entity.RoleType.USER) {
            // USER can only see their own store (if any)
            if (requester.getStore() != null) {
                return java.util.Collections.singletonList(toDto(requester.getStore()));
            }
        }
        return java.util.Collections.emptyList();
    }

    public List<StoreResponseDTO> getStoresBySellerId(Long sellerId) {
        return storeRepository.findAllBySellerId(sellerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public StoreResponseDTO getStoreById(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store không tồn tại"));
        return toDto(store);
    }

    public void deleteStore(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store không tồn tại"));
        storeRepository.delete(store);
    }

    private StoreResponseDTO toDto(Store store) {
        return StoreResponseDTO.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .sellerId(store.getSeller() != null ? store.getSeller().getId() : null)
                .sellerName(store.getSeller() != null ? store.getSeller().getFullName() : null)
                .build();
    }
}
