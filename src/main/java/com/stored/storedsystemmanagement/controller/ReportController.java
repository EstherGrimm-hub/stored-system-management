package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.DashboardResponseDTO;
import com.stored.storedsystemmanagement.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponseDTO> getDashboard() {
        DashboardResponseDTO response = reportService.getDashboardStats();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}