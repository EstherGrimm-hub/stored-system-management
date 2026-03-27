package com.stored.storedsystemmanagement.service;

import com.stored.storedsystemmanagement.entity.*;
import com.stored.storedsystemmanagement.repository.*;
import com.stored.storedsystemmanagement.dto.OrderRequestDTO;
import com.stored.storedsystemmanagement.dto.OrderDetailRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockCardRepository stockCardRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    @Transactional(rollbackFor = Exception.class) // Đảm bảo tính toàn vẹn dữ liệu
    public Order createRetailOrder(OrderRequestDTO req, Long storeId, Long userId) {
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Cửa hàng không tồn tại"));
        User cashier = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Thu ngân không tồn tại"));

        // 1. Tạo vỏ hóa đơn (Khách vãng lai) với mã duy nhất
        String orderCode;
        do {
            orderCode = "HD" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        } while (orderRepository.existsByOrderCode(orderCode));

        Order order = Order.builder()
                .orderCode(orderCode)
                .store(store)
                .createdBy(cashier)
                .totalAmount(BigDecimal.ZERO)
                .discountAmount(req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO)
                .finalAmount(BigDecimal.ZERO)
                .customerTendered(req.getCustomerTendered())
                .status("COMPLETED")
                .orderDetails(new ArrayList<>())
                .build();

        order = orderRepository.save(order); // Thực sự tạo đơn trước để tránh FK order_id null trong chi tiết

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        // 2. Xử lý logic cho từng món hàng trong giỏ
        for (OrderDetailRequestDTO itemReq : req.getItems()) {
            Product product = productRepository.findByIdAndStoreId(itemReq.getProductId(), storeId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không hợp lệ"));

            // Kiểm tra tồn kho
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getProductName() + "' chỉ còn " + product.getStockQuantity() + " trong kho!");
            }

            // Trừ tồn kho
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Ghi thẻ kho
            StockCard stockCard = StockCard.builder()
                    .product(product)
                    .store(store)
                    .changeType("SELL") // Loại giao dịch: Bán hàng
                    .quantityChange(-itemReq.getQuantity()) // Số lượng âm (xuất kho)
                    .balanceQuantity(product.getStockQuantity()) // Tồn kho cuối cùng
                    .referenceCode(order.getOrderCode())
                    .note("Bán lẻ cho khách vãng lai")
                    .build();
            stockCardRepository.save(stockCard);

            // Tính tiền và tạo chi tiết hóa đơn
            BigDecimal itemTotal = product.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            calculatedTotal = calculatedTotal.add(itemTotal);

            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getSellingPrice())
                    .totalPrice(itemTotal)
                    .build();

            order.getOrderDetails().add(detail);
        }

        // 3. Tính toán dòng tiền cuối cùng
        order.setTotalAmount(calculatedTotal);
        order.setFinalAmount(calculatedTotal.subtract(order.getDiscountAmount()));
        order.setCustomerTendered(req.getCustomerTendered());
        order.setChangeAmount(order.getCustomerTendered().subtract(order.getFinalAmount()));

        if (order.getCustomerTendered().compareTo(order.getFinalAmount()) < 0) {
            throw new RuntimeException("Khách thanh toán chưa đủ tiền!");
        }

        try {
            return orderRepository.save(order);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            String causeMsg = e.getMostSpecificCause() != null ? e.getMostSpecificCause().getMessage() : e.getMessage();
            log.error("Constraint violation khi tạo đơn bán lẻ: {}", causeMsg, e);
            throw new RuntimeException("Lỗi ràng buộc dữ liệu khi tạo đơn: " + causeMsg, e);
        } catch (Exception e) {
            log.error("Lỗi bất ngờ khi tạo đơn bán lẻ: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi hệ thống khi tạo đơn bán lẻ. Vui lòng thử lại sau.", e);
        }
    }
}