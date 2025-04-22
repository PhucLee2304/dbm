package com.example.demo.service.hieu;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.demo.dto.hieu.OrderOfflineDTO;
import com.example.demo.dto.hieu.OrderOfflineDetailDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                return ResponseData.error("Customer not found");
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
                return ResponseData.error("Product not found");
            }

            BranchProduct branchProduct = branchProductOptional.get();

            if (request.getQuantity() > branchProduct.getStock()) {
                return ResponseData.error("Not enough stock");
            }

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

            return ResponseData.success("Add new temperature order successfully", order);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData updateOrderOnline(Long id){
        try{
            Optional<Order> orderOptional = orderRepository.findById(id);
            if(orderOptional.isEmpty()) {
                return ResponseData.error("Order not found");
            }

            Order order = orderOptional.get();
            order.setStatus(OrderStatusEnum.COMPLETED);
            orderRepository.save(order);

            return ResponseData.success("Update temperature order successfully", order);

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
                return ResponseData.error("Only staff can action");
            }

            Optional<Staff> staffOptional = staffRepository.findByUserId(user.getId());
            if (staffOptional.isEmpty()) {
                return ResponseData.error("Staff not found");
            }
            Staff staff = staffOptional.get();

            List<ProductDetailDTO> products =
                    productRepository.findAllProductByBranchId(staff.getBranch().getId(), keyword);

            if (products.isEmpty()) {
                return ResponseData.error("Product not found");
            }

            return ResponseData.success("Fetched all products successfully", products);

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
                return ResponseData.error("Only staff can add offline order");
            }

            Optional<Staff> staffOptional = staffRepository.findByUserId(user.getId());
            if (staffOptional.isEmpty()) {
                return ResponseData.error("Staff not found");
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
                        return ResponseData.error("Product not found");
                    }

                    BranchProduct branchProduct = branchProductOptional.get();
                    if (branchProduct.getStock() < quantity) {
                        return ResponseData.error("Not enough stock");
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

//            return ResponseData.success("Add new order offline successfully", order);
            return ResponseData.success("Add new order offline successfully", toOrderOfflineDTO(orderOffline, orderDetails));

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
        for(OrderDetail orderDetail : orderDetails) {
            OrderOfflineDetailDTO detailDTO = new OrderOfflineDetailDTO();
            detailDTO.setProductName(orderDetail.getBranchProduct().getProduct().getName());
            detailDTO.setQuantity(orderDetail.getQuantity());

            details.add(detailDTO);
        }

        dto.setDetails(details);
        return dto;
    }
}
