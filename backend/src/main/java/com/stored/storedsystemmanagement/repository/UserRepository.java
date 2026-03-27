package com.stored.storedsystemmanagement.repository;

import com.stored.storedsystemmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm cực kỳ quan trọng để Spring Security tìm user lúc đăng nhập
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}