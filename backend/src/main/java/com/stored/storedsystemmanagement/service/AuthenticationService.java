package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.AuthenticationRequest;
import com.stored.storedsystemmanagement.dto.AuthenticationResponse;
import com.stored.storedsystemmanagement.dto.RegisterRequest;
import com.stored.storedsystemmanagement.entity.RoleType;
import com.stored.storedsystemmanagement.entity.Store;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import com.stored.storedsystemmanagement.repository.UserRepository;
import com.stored.storedsystemmanagement.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if(repository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        // New users always register as USER role (Store Owner)
        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(RoleType.USER)  // Always USER role for new registrations
                .build();
        try {
            repository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo người dùng: " + e.getMessage());
        }
        
        String jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .fullName(user.getFullName())
                .role(user.getRole().getValue())
                .hasStore(false)  // New users have no store yet
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác!");
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new RuntimeException("Tên đăng nhập không tồn tại!");
        } catch (Exception e) {
            throw new RuntimeException("Lỗi xác thực: " + e.getMessage());
        }
        
        User user = repository.findByUsername(request.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        String jwtToken = jwtService.generateToken(user);
        
        AuthenticationResponse.AuthenticationResponseBuilder builder = AuthenticationResponse.builder()
                .token(jwtToken)
                .fullName(user.getFullName())
                .role(user.getRole().getValue())
                .hasStore(false);
        
        // If USER role, check if they have a store assigned
        if (user.getRole() == RoleType.USER && user.getStore() != null) {
            builder.storeId(user.getStore().getId());
            builder.storeName(user.getStore().getName());
            builder.hasStore(true);
        }
        
        return builder.build();
    }
}
