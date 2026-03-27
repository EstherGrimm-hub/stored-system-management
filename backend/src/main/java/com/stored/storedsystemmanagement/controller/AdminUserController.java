package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.UserResponseDTO;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {

  private final UserService userService;

  /**
   * Get all users (Admin only)
   */
  @GetMapping
  public List<UserResponseDTO> getAllUsers() {
    return userService.getAllUsers();
  }

  /**
   * Get user by ID (Admin only)
   */
  @GetMapping("/{userId}")
  public UserResponseDTO getUserById(@PathVariable Long userId) {
    return userService.getUserById(userId);
  }

  /**
   * Update user by ID (Admin only)
   */
  @PutMapping("/{userId}")
  public UserResponseDTO updateUser(
      @PathVariable Long userId,
      @Valid @RequestBody User user) {
    return userService.updateUser(userId, user);
  }

  /**
   * Delete user by ID (Admin only)
   */
  @DeleteMapping("/{userId}")
  public void deleteUser(@PathVariable Long userId) {
    userService.deleteUser(userId);
  }

  /**
   * Get stores count (Admin only)
   */
  @GetMapping("/stats/stores-count")
  public long getStoresCount() {
    return userService.getStoresCount();
  }

  /**
   * Get active users count (Admin only)
   */
  @GetMapping("/stats/active-users-count")
  public long getActiveUsersCount() {
    return userService.getActiveUsersCount();
  }
}
