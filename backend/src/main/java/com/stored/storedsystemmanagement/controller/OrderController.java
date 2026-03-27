package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.OrderRequestDTO;
import com.stored.storedsystemmanagement.dto.OrderResponseDTO;
import com.stored.storedsystemmanagement.entity.Order;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.OrderRepository;
import com.stored.storedsystemmanagement.repository.UserRepository;
import com.stored.storedsystemmanagement.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    // API: Thu ngân bấm thanh toán tạo hóa đơn (Khách lẻ)
    @PostMapping("/retail")
    public ResponseEntity<Order> createRetailOrder(@Valid @RequestBody OrderRequestDTO req, Principal principal) {
        User user = getCurrentUser(principal);
        // Chuyển việc tạo Order xuống Service xử lý Transaction
        return ResponseEntity.ok(orderService.createRetailOrder(req, user.getStore().getId(), user.getId()));
    }

    // API: Chủ shop xem danh sách hóa đơn đã bán
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrdersHistory(Principal principal) {
        User user = getCurrentUser(principal);
        List<Order> orders;
        if (user.getStore() != null) {
            orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(user.getStore().getId());
        } else {
            // Trường hợp ADMIN hoặc user chưa map store: trả hết để không trống lịch sử
            orders = orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        }
        List<OrderResponseDTO> response = orders.stream()
                .map(orderService::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}