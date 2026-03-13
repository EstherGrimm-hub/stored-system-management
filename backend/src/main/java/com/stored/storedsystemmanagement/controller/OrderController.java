package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.OrderRequestDTO;
import com.stored.storedsystemmanagement.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@Valid @RequestBody OrderRequestDTO requestDTO) {
        String message = orderService.checkoutProcess(requestDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}