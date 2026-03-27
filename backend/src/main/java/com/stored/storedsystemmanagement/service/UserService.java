package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.UserResponseDTO;
import com.stored.storedsystemmanagement.entity.RoleType;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.UserRepository;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import com.stored.storedsystemmanagement.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;

    public List<UserResponseDTO> getAllSellers() {
        // Get all USER role users (Store Owners)
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == RoleType.USER)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all users (for Admin dashboard)
     */
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    public UserResponseDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    /**
     * Update user by ID
     */
    public UserResponseDTO updateUser(Long userId, User updateUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateUser.getFullName() != null) {
            user.setFullName(updateUser.getFullName());
        }
        
        if (updateUser.getPassword() != null) {
            user.setPassword(updateUser.getPassword());
        }
        
        User saved = userRepository.save(user);
        return toDto(saved);
    }

    /**
     * Delete user by ID - handles all constraints
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Step 1: Delete all orders created by this user to avoid FK constraint
        // Orders have a foreign key to createdBy (user_id)
        orderRepository.deleteAll(orderRepository.findAll().stream()
                .filter(order -> order.getCreatedBy() != null && order.getCreatedBy().getId().equals(userId))
                .collect(Collectors.toList()));
        
        // Step 2: Delete the store if user is a seller (has store assigned)
        if (user.getStore() != null) {
            Long storeId = user.getStore().getId();
            storeRepository.deleteById(storeId);
        }
        
        // Step 3: Delete the user
        userRepository.delete(user);
    }

    /**
     * Get total stores count
     */
    public long getStoresCount() {
        return storeRepository.count();
    }

    /**
     * Get active users count
     */
    public long getActiveUsersCount() {
        // Assuming active users are those with USER role
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == RoleType.USER)
                .count();
    }

    private UserResponseDTO toDto(User user) {
        Long storeId = user.getStore() != null ? user.getStore().getId() : null;
        String storeName = user.getStore() != null ? user.getStore().getName() : null;
        boolean hasStore = user.getStore() != null;
        return UserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .role(user.getRole())
                .storeId(storeId)
                .storeName(storeName)
                .hasStore(hasStore)
                .build();
    }
}
