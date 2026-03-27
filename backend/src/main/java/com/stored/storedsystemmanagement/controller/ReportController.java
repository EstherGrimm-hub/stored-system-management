package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.entity.RoleType;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.UserRepository;
import com.stored.storedsystemmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Principal principal,
                                                                 @RequestParam(required = false) Long storeId) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        if (user.getRole() == RoleType.ADMIN) {
            if (storeId != null) {
                return ResponseEntity.ok(reportService.getDashboardStats(storeId));
            }
            return ResponseEntity.ok(reportService.getAdminDashboardStats());
        } else {
            // Truyền storeId lấy từ User đang đăng nhập vào hàm
            return ResponseEntity.ok(reportService.getDashboardStats(user.getStore().getId()));
        }
    }

    @GetMapping("/dashboard/chart")
    public ResponseEntity<Map<String, Object>> getRevenueChartData(Principal principal,
                                                                   @RequestParam(required = false) Long storeId) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        if (user.getRole() == RoleType.ADMIN) {
            return ResponseEntity.ok(reportService.getRevenueChartData(storeId));
        }

        return ResponseEntity.ok(reportService.getRevenueChartData(user.getStore().getId()));
    }

    @GetMapping("/dashboard/top-products")
    public ResponseEntity<List<Map<String, Object>>> getTopProducts(
            Principal principal,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(required = false) Long storeId) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        if (user.getRole() == RoleType.ADMIN) {
            return ResponseEntity.ok(reportService.getTopProducts(storeId, days));
        }

        return ResponseEntity.ok(reportService.getTopProducts(user.getStore().getId(), days));
    }

    @GetMapping("/dashboard/comparison")
    public ResponseEntity<Map<String, Object>> getComparisonStats(Principal principal,
                                                                  @RequestParam(required = false) Long storeId) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));

        if (user.getRole() == RoleType.ADMIN) {
            return ResponseEntity.ok(reportService.getComparisonStats(storeId));
        }

        return ResponseEntity.ok(reportService.getComparisonStats(user.getStore().getId()));
    }
}