package com.example.demo.service.tien;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.BranchProduct;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderDetail;
import com.example.demo.entity.OrderOnline;
import com.example.demo.entity.User;
import com.example.demo.enums.OrderStatusEnum;
import com.example.demo.interfaces.tien.CustomerOrderInterface;
import com.example.demo.repository.BranchProductRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.OrderDetailRepository;
import com.example.demo.repository.OrderOnlineRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.utils.ResponseData;
import com.example.demo.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerOrderService implements CustomerOrderInterface {
    private final OrderRepository orderRepository;
    private final OrderOnlineRepository orderOnlineRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CustomerRepository customerRepository;
    private final BranchProductRepository branchProductRepository;
    private final UserUtil userUtil;

    @Override
    public ResponseData getAllCustomerOrders() {
        try {
            // Lấy thông tin người dùng hiện tại
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            // Lấy thông tin customer từ user
            Optional<Customer> customerOptional = customerRepository.findByUserId(user.getId());
            if (customerOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy thông tin khách hàng");
            }
            Customer customer = customerOptional.get();

            // Lấy danh sách các đơn hàng online của customer sắp xếp theo ngày tạo giảm dần
            List<OrderOnline> orderOnlines = orderOnlineRepository.findByCustomerIdOrderByCreatedDesc(customer.getId());
            if (orderOnlines.isEmpty()) {
                return ResponseData.success("Không có đơn hàng nào", Collections.emptyList());
            }

            // Chuẩn bị kết quả trả về
            List<Map<String, Object>> result = new ArrayList<>();
            for (OrderOnline orderOnline : orderOnlines) {
                Order order = orderOnline.getOrder();
                Map<String, Object> orderData = new HashMap<>();

                // Thông tin cơ bản của đơn hàng
                orderData.put("id", order.getId());
                orderData.put("subtotal", order.getSubtotal());
                orderData.put("shippingFee", order.getShippingFee());
                orderData.put("total", order.getTotal());
                orderData.put("created", order.getCreated());
                orderData.put("status", order.getStatus());

                // Thông tin người nhận
                orderData.put("recipientName", orderOnline.getRecipientName());
                orderData.put("recipientPhone", orderOnline.getRecipientPhone());
                orderData.put("recipientAddress", orderOnline.getRecipientAddress());
                orderData.put("note", orderOnline.getNote());

                // Lấy chi tiết đơn hàng
                List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());
                orderData.put("orderDetails", orderDetails);

                result.add(orderData);
            }

            return ResponseData.success("Lấy danh sách đơn hàng thành công", result);
        } catch (Exception e) {
            return ResponseData.error("Lỗi khi lấy danh sách đơn hàng: " + e.getMessage());
        }
    }

    @Override
    public ResponseData getCustomerOrderById(Long id) {
        try {
            // Lấy thông tin người dùng hiện tại
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            // Lấy thông tin customer từ user
            Optional<Customer> customerOptional = customerRepository.findByUserId(user.getId());
            if (customerOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy thông tin khách hàng");
            }
            Customer customer = customerOptional.get();

            // Kiểm tra đơn hàng có tồn tại không
            Optional<Order> orderOptional = orderRepository.findById(id);
            if (orderOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng");
            }
            Order order = orderOptional.get();

            // Kiểm tra đơn hàng có thuộc về customer không
            Optional<OrderOnline> orderOnlineOptional = orderOnlineRepository.findByOrderId(id);
            if (orderOnlineOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng online");
            }
            OrderOnline orderOnline = orderOnlineOptional.get();

            if (!orderOnline.getCustomer().getId().equals(customer.getId())) {
                return ResponseData.error("Bạn không có quyền xem đơn hàng này");
            }

            // Chuẩn bị kết quả trả về
            Map<String, Object> orderData = new HashMap<>();

            // Thông tin cơ bản của đơn hàng
            orderData.put("id", order.getId());
            orderData.put("subtotal", order.getSubtotal());
            orderData.put("shippingFee", order.getShippingFee());
            orderData.put("total", order.getTotal());
            orderData.put("created", order.getCreated());
            orderData.put("status", order.getStatus());

            // Thông tin người nhận
            orderData.put("recipientName", orderOnline.getRecipientName());
            orderData.put("recipientPhone", orderOnline.getRecipientPhone());
            orderData.put("recipientAddress", orderOnline.getRecipientAddress());
            orderData.put("note", orderOnline.getNote());

            // Lấy chi tiết đơn hàng
            List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());
            orderData.put("orderDetails", orderDetails);

            return ResponseData.success("Lấy thông tin đơn hàng thành công", orderData);
        } catch (Exception e) {
            return ResponseData.error("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseData cancelOrder(Long id) {
        try {
            // Lấy thông tin người dùng hiện tại
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            // Lấy thông tin customer từ user
            Optional<Customer> customerOptional = customerRepository.findByUserId(user.getId());
            if (customerOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy thông tin khách hàng");
            }
            Customer customer = customerOptional.get();

            // Kiểm tra đơn hàng có tồn tại không
            Optional<Order> orderOptional = orderRepository.findById(id);
            if (orderOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng");
            }
            Order order = orderOptional.get();

            // Kiểm tra đơn hàng có thuộc về customer không
            Optional<OrderOnline> orderOnlineOptional = orderOnlineRepository.findByOrderId(id);
            if (orderOnlineOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng online");
            }
            OrderOnline orderOnline = orderOnlineOptional.get();

            if (!orderOnline.getCustomer().getId().equals(customer.getId())) {
                return ResponseData.error("Bạn không có quyền hủy đơn hàng này");
            }

            // Kiểm tra trạng thái đơn hàng, chỉ cho phép hủy đơn hàng đang ở trạng thái PENDING
            if (order.getStatus() != OrderStatusEnum.PENDING) {
                return ResponseData.error("Chỉ có thể hủy đơn hàng đang ở trạng thái chờ xử lý");
            }

            // Lấy tất cả OrderDetail của đơn hàng này để hoàn trả stock
            List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());

            // Hoàn trả stock cho từng sản phẩm
            for (OrderDetail orderDetail : orderDetails) {
                BranchProduct branchProduct = orderDetail.getBranchProduct();
                if (branchProduct != null) {
                    // Cộng lại số lượng đã trừ khi tạo đơn hàng
                    branchProduct.setStock(branchProduct.getStock() + orderDetail.getQuantity());
                    branchProductRepository.save(branchProduct);
                }
            }

            // Cập nhật trạng thái đơn hàng
            order.setStatus(OrderStatusEnum.CANCELLED);
            orderRepository.save(order);

            return ResponseData.success("Hủy đơn hàng thành công", order);
        } catch (Exception e) {
            return ResponseData.error("Lỗi khi hủy đơn hàng: " + e.getMessage());
        }
    }
}
