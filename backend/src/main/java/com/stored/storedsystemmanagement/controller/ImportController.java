package com.stored.storedsystemmanagement.controller;

import com.stored.storedsystemmanagement.dto.ImportRequestDTO;
import com.stored.storedsystemmanagement.service.ImportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/imports")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping
    public ResponseEntity<String> importGoods(@Valid @RequestBody ImportRequestDTO requestDTO) {
        String message = importService.processImport(requestDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}