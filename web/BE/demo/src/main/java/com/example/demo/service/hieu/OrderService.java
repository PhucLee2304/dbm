package com.example.demo.service.hieu;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.hieu.OrderOfflineDTO;
import com.example.demo.dto.hieu.OrderOfflineDetailDTO;
import com.example.demo.dto.tien.ProductDetailDTO;
import com.example.demo.entity.BranchProduct;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderDetail;
import com.example.demo.entity.OrderOffline;
import com.example.demo.entity.OrderOnline;
import com.example.demo.entity.Staff;
import com.example.demo.entity.User;
import com.example.demo.enums.OrderStatusEnum;
import com.example.demo.interfaces.hieu.OrderInterface;
import com.example.demo.repository.*;
import com.example.demo.request.hieu.AddOrderOfflineRequest;
import com.example.demo.request.hieu.PrepareOrderOnlineRequest;
import com.example.demo.service.tien.DashboardService;
import com.example.demo.utils.ResponseData;
import com.example.demo.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderInterface {
    private final OrderRepository orderRepository;
    private final UserUtil userUtil;
    private final CustomerRepository customerRepository;
    private final OrderOnlineRepository orderOnlineRepository;
    private final BranchProductRepository branchProductRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final StaffRepository staffRepository;
    private final OrderOfflineRepository orderOfflineRepository;
    private final ProductRepository productRepository;
    private final DashboardService dashboardService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private void updateOrderDashboard() {
        ResponseData revenue = dashboardService.getTotalRevenue();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/revenue", revenue);

        ResponseData topProducts = dashboardService.getTopProducts();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/top-product", topProducts);

        ResponseData topStaff = dashboardService.getTopStaff();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/top-staff", topStaff);

        ResponseData topCustomer = dashboardService.getTopCustomer();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/top-customer", topCustomer);

        ResponseData dailyRevenueLastMonth = dashboardService.getEachDayRevenueLastMonth();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/daily-revenue-last-month", dailyRevenueLastMonth);

        ResponseData totalOrders = dashboardService.getTotalOrders();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-orders", totalOrders);

        ResponseData totalOnlineOrders = dashboardService.getTotalOnlineOrders();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-online-orders", totalOnlineOrders);

        ResponseData totalOfflineOrders = dashboardService.getTotalOfflineOrders();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-offline-orders", totalOfflineOrders);
    }

    @Override
    @Transactional
    public ResponseData prepareOrderOnline(PrepareOrderOnlineRequest request) {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            Optional<Customer> customerOptional = customerRepository.findByUserId(user.getId());
            if (customerOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy khách hàng");
            }
            Customer customer = customerOptional.get();

            Order order = new Order();
            order.setSubtotal(0);
            order.setShippingFee(0);
            order.setTotal(0);
            order.setCreated(LocalDateTime.now());
            order.setStatus(OrderStatusEnum.PENDING);

            orderRepository.save(order);

            OrderOnline orderOnline = new OrderOnline();
            orderOnline.setOrder(order);
            orderOnline.setCustomer(customer);
            orderOnline.setRecipientName(user.getName());
            orderOnline.setRecipientPhone(user.getPhone());
            orderOnline.setRecipientAddress(user.getAddress());

            orderOnlineRepository.save(orderOnline);

            Optional<BranchProduct> branchProductOptional =
                    branchProductRepository.findByBranchIdAndProductId(1L, request.getProductId());
            if (branchProductOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy sản phẩm");
            }

            BranchProduct branchProduct = branchProductOptional.get();

            if (request.getQuantity() > branchProduct.getStock()) {
                return ResponseData.error("Không đủ hàng");
            }

            // Trừ số lượng sản phẩm trong kho
            branchProduct.setStock(branchProduct.getStock() - request.getQuantity());
            branchProductRepository.save(branchProduct);

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setKeyOrderDetail(
                    order.getId(),
                    branchProduct.getKeyBranchProduct().getBranch_id(),
                    branchProduct.getKeyBranchProduct().getProduct_id());
            orderDetail.setOrder(order);
            orderDetail.setBranchProduct(branchProduct);
            orderDetail.setQuantity(request.getQuantity());
            orderDetail.setPrice(
                    request.getQuantity() * branchProduct.getProduct().getPrice());

            orderDetailRepository.save(orderDetail);

            double price = orderDetail.getPrice();
            order.setSubtotal(price);

            double shippingFee = Math.round(price * 0.1 / 1000.0) * 1000;
            order.setShippingFee(shippingFee);

            order.setTotal(price + shippingFee);

            orderRepository.save(order);

            return ResponseData.success("Thêm hàng tạm thời thành công", order);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData updateOrderOnline(Long id) {
        try {
            Optional<Order> orderOptional = orderRepository.findById(id);
            if (orderOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng");
            }

            Order order = orderOptional.get();
            order.setStatus(OrderStatusEnum.COMPLETED);
            orderRepository.save(order);

            ResponseData responseData = ResponseData.success("Cập nhật đơn hàng thành công", order);

            if (responseData.isSuccess()) {
                updateOrderDashboard();
            }

            return responseData;

            //            return ResponseData.success("Update temperature order successfully", order);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseData cancelOrder(Long id) {
        try {
            Optional<Order> orderOptional = orderRepository.findById(id);
            if (orderOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng");
            }

            Order order = orderOptional.get();

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

            order.setStatus(OrderStatusEnum.CANCELLED);
            orderRepository.save(order);

            ResponseData responseData = ResponseData.success("Hủy đơn hàng thành công", order);

            if (responseData.isSuccess()) {
                updateOrderDashboard();
            }

            return responseData;

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getProductByKeyword(String keyword) {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            if (!user.getRole().toString().equals("STAFF")) {
                return ResponseData.error("Chỉ nhân viên mới có thể thực hiện hành động này");
            }

            Optional<Staff> staffOptional = staffRepository.findByUserId(user.getId());
            if (staffOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy thông tin nhân viên");
            }
            Staff staff = staffOptional.get();

            List<ProductDetailDTO> products =
                    productRepository.findAllProductByBranchId(staff.getBranch().getId(), keyword);

            if (products.isEmpty()) {
                return ResponseData.error("Không tìm thấy sản phẩm");
            }

            return ResponseData.success("Lấy danh sách sản phẩm thành công", products);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData addOrderOffline(AddOrderOfflineRequest request) {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            if (!user.getRole().toString().equals("STAFF")) {
                return ResponseData.error("Chỉ nhân viên mới có thể tạo đơn hàng tại cửa hàng");
            }

            Optional<Staff> staffOptional = staffRepository.findByUserId(user.getId());
            if (staffOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy thông tin nhân viên");
            }
            Staff staff = staffOptional.get();

            Order order = new Order();
            order.setSubtotal(0);
            order.setShippingFee(0);
            order.setTotal(0);
            order.setCreated(LocalDateTime.now());
            order.setStatus(OrderStatusEnum.PENDING);

            OrderOffline orderOffline = new OrderOffline();
            orderOffline.setOrder(order);
            orderOffline.setStaff(staff);

            List<Map<BranchProduct, Integer>> branchProductQuantities = new ArrayList<>();
            for (Map<Long, Integer> item : request.getItems()) {
                for (Map.Entry<Long, Integer> entry : item.entrySet()) {
                    Long productId = entry.getKey();
                    Integer quantity = entry.getValue();
                    Optional<BranchProduct> branchProductOptional = branchProductRepository.findByBranchIdAndProductId(
                            staff.getBranch().getId(), productId);
                    if (branchProductOptional.isEmpty()) {
                        return ResponseData.error("Không tìm thấy sản phẩm");
                    }

                    BranchProduct branchProduct = branchProductOptional.get();
                    if (branchProduct.getStock() < quantity) {
                        return ResponseData.error("Không đủ hàng trong kho");
                    }

                    Map<BranchProduct, Integer> branchProductQuantitiesMap = new HashMap<>();
                    branchProductQuantitiesMap.put(branchProduct, quantity);
                    branchProductQuantities.add(branchProductQuantitiesMap);
                }
            }

            orderRepository.save(order);

            orderOfflineRepository.save(orderOffline);

            List<OrderDetail> orderDetails = new ArrayList<>();
            double subtotal = 0;
            for (Map<BranchProduct, Integer> branchProductMap : branchProductQuantities) {
                for (Map.Entry<BranchProduct, Integer> entry : branchProductMap.entrySet()) {
                    BranchProduct branchProduct = entry.getKey();
                    Integer quantity = entry.getValue();

                    branchProduct.setStock(branchProduct.getStock() - quantity);
                    branchProductRepository.save(branchProduct);

                    OrderDetail orderDetail = new OrderDetail();
                    orderDetail.setKeyOrderDetail(
                            order.getId(),
                            branchProduct.getBranch().getId(),
                            branchProduct.getProduct().getId());
                    orderDetail.setOrder(order);
                    orderDetail.setBranchProduct(branchProduct);
                    orderDetail.setQuantity(quantity);
                    double price = branchProduct.getProduct().getPrice() * quantity;
                    orderDetail.setPrice(price);

                    orderDetails.add(orderDetail);
                    subtotal += price;
                }
            }

            orderDetailRepository.saveAll(orderDetails);

            order.setSubtotal(subtotal);
            order.setTotal(subtotal);
            order.setStatus(OrderStatusEnum.COMPLETED);

            orderRepository.save(order);

            ResponseData responseData = ResponseData.success(
                    "Thêm đơn hàng Offline thành công", toOrderOfflineDTO(orderOffline, orderDetails));

            if (responseData.isSuccess()) {
                updateOrderDashboard();
            }

            return responseData;

            //            return ResponseData.success("Add new order offline successfully",
            // toOrderOfflineDTO(orderOffline, orderDetails));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllOrders() {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            List<Order> orders = orderRepository.findAllByOrderByCreatedDesc();
            if (orders.isEmpty()) {
                return ResponseData.success("Không có đơn hàng nào", Collections.emptyList());
            }

            // Convert orders to DTOs with additional information
            List<Map<String, Object>> orderDTOs = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderDTO = new HashMap<>();
                orderDTO.put("id", order.getId());
                orderDTO.put("subtotal", order.getSubtotal());
                orderDTO.put("shippingFee", order.getShippingFee());
                orderDTO.put("total", order.getTotal());
                orderDTO.put("created", order.getCreated());
                orderDTO.put("status", order.getStatus());

                // Check if it's an offline order
                List<OrderOffline> orderOfflines = orderOfflineRepository.findAllByOrderId(order.getId());
                if (!orderOfflines.isEmpty()) {
                    OrderOffline orderOffline = orderOfflines.get(0);
                    Staff staff = orderOffline.getStaff();
                    orderDTO.put("type", "OFFLINE");
                    orderDTO.put("staff", staff);
                    orderDTO.put("branch", staff.getBranch());
                } else {
                    // Check if it's an online order
                    List<OrderOnline> orderOnlines = orderOnlineRepository.findAllByOrderId(order.getId());
                    if (!orderOnlines.isEmpty()) {
                        OrderOnline orderOnline = orderOnlines.get(0);
                        Customer customer = orderOnline.getCustomer();
                        orderDTO.put("type", "ONLINE");
                        orderDTO.put("customer", customer);
                        orderDTO.put("recipientName", orderOnline.getRecipientName());
                        orderDTO.put("recipientPhone", orderOnline.getRecipientPhone());
                        orderDTO.put("recipientAddress", orderOnline.getRecipientAddress());
                    }
                }

                // Get order details
                List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());
                orderDTO.put("orderDetails", orderDetails);

                orderDTOs.add(orderDTO);
            }

            return ResponseData.success("Lấy danh sách đơn hàng thành công", orderDTOs);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getOrderById(Long id) {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            Optional<Order> orderOpt = orderRepository.findById(id);
            if (orderOpt.isEmpty()) {
                return ResponseData.error("Không tìm thấy đơn hàng");
            }

            Order order = orderOpt.get();
            Map<String, Object> orderDTO = new HashMap<>();
            orderDTO.put("id", order.getId());
            orderDTO.put("subtotal", order.getSubtotal());
            orderDTO.put("shippingFee", order.getShippingFee());
            orderDTO.put("total", order.getTotal());
            orderDTO.put("created", order.getCreated());
            orderDTO.put("status", order.getStatus());

            // Check if it's an offline order
            List<OrderOffline> orderOfflines = orderOfflineRepository.findAllByOrderId(order.getId());
            if (!orderOfflines.isEmpty()) {
                OrderOffline orderOffline = orderOfflines.get(0);
                Staff staff = orderOffline.getStaff();
                orderDTO.put("type", "OFFLINE");
                orderDTO.put("staff", staff);
                orderDTO.put("branch", staff.getBranch());
            } else {
                // Check if it's an online order
                List<OrderOnline> orderOnlines = orderOnlineRepository.findAllByOrderId(order.getId());
                if (!orderOnlines.isEmpty()) {
                    OrderOnline orderOnline = orderOnlines.get(0);
                    Customer customer = orderOnline.getCustomer();
                    orderDTO.put("type", "ONLINE");
                    orderDTO.put("customer", customer);
                    orderDTO.put("recipientName", orderOnline.getRecipientName());
                    orderDTO.put("recipientPhone", orderOnline.getRecipientPhone());
                    orderDTO.put("recipientAddress", orderOnline.getRecipientAddress());
                }
            }

            // Get order details
            List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderId(order.getId());
            orderDTO.put("orderDetails", orderDetails);

            return ResponseData.success("Lấy thông tin đơn hàng thành công", orderDTO);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    private OrderOfflineDTO toOrderOfflineDTO(OrderOffline orderOffline, List<OrderDetail> orderDetails) {
        OrderOfflineDTO dto = new OrderOfflineDTO();
        dto.setOrderId(orderOffline.getOrder().getId());
        dto.setSubTotal(orderOffline.getOrder().getSubtotal());
        dto.setShippingFee(orderOffline.getOrder().getShippingFee());
        dto.setTotal(orderOffline.getOrder().getTotal());
        dto.setCreated(orderOffline.getOrder().getCreated());
        dto.setStaffCode(orderOffline.getStaff().getCode());
        dto.setBranchName(orderOffline.getStaff().getBranch().getAddress());

        List<OrderOfflineDetailDTO> details = new ArrayList<>();
        for (OrderDetail orderDetail : orderDetails) {
            OrderOfflineDetailDTO detailDTO = new OrderOfflineDetailDTO();
            detailDTO.setProductName(orderDetail.getBranchProduct().getProduct().getName());
            detailDTO.setQuantity(orderDetail.getQuantity());

            details.add(detailDTO);
        }

        dto.setDetails(details);
        return dto;
    }
}
