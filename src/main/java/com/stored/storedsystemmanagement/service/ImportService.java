package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.ImportDetailRequestDTO;
import com.stored.storedsystemmanagement.dto.ImportRequestDTO;
import com.stored.storedsystemmanagement.entity.ImportDetail;
import com.stored.storedsystemmanagement.entity.ImportReceipt;
import com.stored.storedsystemmanagement.entity.Product;
import com.stored.storedsystemmanagement.entity.StockCard;
import com.stored.storedsystemmanagement.repository.ImportReceiptRepository;
import com.stored.storedsystemmanagement.repository.ProductRepository;
import com.stored.storedsystemmanagement.repository.StockCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final ImportReceiptRepository importReceiptRepository;
    private final ProductRepository productRepository;
    private final StockCardRepository stockCardRepository;

    @Transactional
    public String processImport(ImportRequestDTO requestDTO) {
        // 1. Khởi tạo phiếu nhập
        String receiptCode = "PN" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        ImportReceipt receipt = ImportReceipt.builder()
                .receiptCode(receiptCode)
                .importDetails(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<StockCard> stockCardsToSave = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        // 2. Duyệt qua từng món hàng cần nhập
        for (ImportDetailRequestDTO item : requestDTO.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + item.getProductId()));

            // Tính tiền nhập
            BigDecimal subTotal = item.getImportPrice().multiply(new BigDecimal(item.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            // Tạo chi tiết phiếu nhập
            ImportDetail detail = ImportDetail.builder()
                    .importReceipt(receipt)
                    .product(product)
                    .quantity(item.getQuantity())
                    .importPrice(item.getImportPrice())
                    .subTotal(subTotal)
                    .build();
            receipt.getImportDetails().add(detail);

            // CỘNG TỒN KHO VÀ CẬP NHẬT GIÁ VỐN
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            product.setCostPrice(item.getImportPrice()); // Cập nhật lại giá vốn mới nhất
            productsToUpdate.add(product);

            // GHI THẺ KHO (Dấu dương)
            StockCard stockCard = StockCard.builder()
                    .product(product)
                    .referenceCode(receiptCode)
                    .transactionType("IMPORT") // Loại giao dịch: Nhập hàng
                    .quantityChanged(item.getQuantity()) // Nhập thêm nên mang dấu dương (+)
                    .balance(product.getStockQuantity())
                    .build();
            stockCardsToSave.add(stockCard);
        }

        // 3. Lưu tổng tiền và Đẩy xuống DB
        receipt.setTotalAmount(totalAmount);
        
        importReceiptRepository.save(receipt);
        productRepository.saveAll(productsToUpdate);
        stockCardRepository.saveAll(stockCardsToSave);

        return "Nhập hàng thành công! Mã phiếu nhập: " + receiptCode;
    }
}