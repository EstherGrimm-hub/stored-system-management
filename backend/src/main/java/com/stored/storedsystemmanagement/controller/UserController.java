package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.UserResponseDTO;
import com.stored.storedsystemmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/sellers")
    public ResponseEntity<List<UserResponseDTO>> getAllSellers() {
        List<UserResponseDTO> sellers = userService.getAllSellers();
        return new ResponseEntity<>(sellers, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser(java.security.Principal principal) {
        if (principal == null || principal.getName() == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        UserResponseDTO userDto = userService.getUserByUsername(principal.getName());
        return new ResponseEntity<>(userDto, HttpStatus.OK);
    }
}
