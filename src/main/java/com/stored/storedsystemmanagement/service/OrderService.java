package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.dto.OrderDetailRequestDTO;
import com.stored.storedsystemmanagement.dto.OrderRequestDTO;
import com.stored.storedsystemmanagement.entity.Order;
import com.stored.storedsystemmanagement.entity.OrderDetail;
import com.stored.storedsystemmanagement.entity.Product;
import com.stored.storedsystemmanagement.entity.StockCard;
import com.stored.storedsystemmanagement.repository.OrderRepository;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockCardRepository stockCardRepository;

    // Annotation SIÊU QUAN TRỌNG: Lỗi ở bất kỳ dòng nào sẽ Rollback toàn bộ dữ liệu
    @Transactional 
    public String checkoutProcess(OrderRequestDTO requestDTO) {
        
        // 1. Khởi tạo Hóa đơn
        String orderCode = "HD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        Order order = Order.builder()
                .orderCode(orderCode)
                .status("COMPLETED")
                .discountAmount(requestDTO.getDiscountAmount() != null ? requestDTO.getDiscountAmount() : BigDecimal.ZERO)
                .customerTendered(requestDTO.getCustomerTendered())
                .orderDetails(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<StockCard> stockCardsToSave = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        // 2. Xử lý từng món hàng trong giỏ
        for (OrderDetailRequestDTO item : requestDTO.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + item.getProductId()));

            // Kiểm tra tồn kho
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' không đủ tồn kho! Chỉ còn: " + product.getStockQuantity());
            }

            // Tính tiền món này (Giá bán lúc này * Số lượng)
            BigDecimal subTotal = product.getSellingPrice().multiply(new BigDecimal(item.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            // Tạo Chi tiết hóa đơn
            OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .subTotal(subTotal)
                    .build();
            order.getOrderDetails().add(orderDetail);

            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productsToUpdate.add(product);

            // Ghi Thẻ kho
            StockCard stockCard = StockCard.builder()
                    .product(product)
                    .referenceCode(orderCode)
                    .transactionType("SELL") // Loại giao dịch: Bán hàng
                    .quantityChanged(-item.getQuantity()) // Bán đi nên mang dấu âm
                    .balance(product.getStockQuantity())  // Tồn kho CÒN LẠI
                    .build();
            stockCardsToSave.add(stockCard);
        }

        // 3. Tính toán lại tổng tiền hóa đơn
        BigDecimal finalAmount = totalAmount.subtract(order.getDiscountAmount());
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;

        if (requestDTO.getCustomerTendered().compareTo(finalAmount) < 0) {
            throw new RuntimeException("Khách đưa không đủ tiền! Cần trả: " + finalAmount);
        }

        order.setTotalAmount(totalAmount);
        order.setFinalAmount(finalAmount);
        order.setChangeAmount(requestDTO.getCustomerTendered().subtract(finalAmount)); // Tính tiền thối

        // 4. LƯU TẤT CẢ XUỐNG DATABASE
        orderRepository.save(order); // Lưu order sẽ tự động lưu luôn OrderDetail nhờ cascade=ALL
        productRepository.saveAll(productsToUpdate);
        stockCardRepository.saveAll(stockCardsToSave);

        return "Thanh toán thành công! Mã hóa đơn: " + orderCode;
    }
}