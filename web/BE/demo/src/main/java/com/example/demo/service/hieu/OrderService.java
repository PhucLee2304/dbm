package com.example.demo.service.hieu;

import com.example.demo.entity.*;
import com.example.demo.enums.OrderStatusEnum;
import com.example.demo.interfaces.hieu.OrderInterface;
import com.example.demo.repository.*;
import com.example.demo.request.hieu.PrepareOrderOnlineRequest;
import com.example.demo.utils.ResponseData;
import com.example.demo.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService implements OrderInterface {
    private final OrderRepository orderRepository;
    private final UserUtil userUtil;
    private final CustomerRepository customerRepository;
    private final OrderOnlineRepository orderOnlineRepository;
    private final BranchProductRepository branchProductRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    @Transactional
    public ResponseData prepareOrderOnline(PrepareOrderOnlineRequest request) {
        try{
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if(!getUserInfoResponse.isSuccess()){
                return getUserInfoResponse;
            }
            User user = (User)getUserInfoResponse.getData();

            Optional<Customer> customerOptional = customerRepository.findByUser(user);
            if(customerOptional.isEmpty()){
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

            Optional<BranchProduct> branchProductOptional = branchProductRepository.findByBranchIdAndProductId(1L, request.getProductId());
            if(branchProductOptional.isEmpty()){
                return ResponseData.error("Product not found");
            }

            BranchProduct branchProduct = branchProductOptional.get();

            if(request.getQuantity() > branchProduct.getStock()){
                return ResponseData.error("Not enough stock");
            }

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setKeyOrderDetail(order.getId(), branchProduct.getKeyBranchProduct().getBranch_id(), branchProduct.getKeyBranchProduct().getProduct_id());
            orderDetail.setOrder(order);
            orderDetail.setBranchProduct(branchProduct);
            orderDetail.setQuantity(request.getQuantity());
            orderDetail.setPrice(request.getQuantity() * branchProduct.getProduct().getPrice());

            orderDetailRepository.save(orderDetail);

            double price = orderDetail.getPrice();
            order.setSubtotal(price);

            double shippingFee = Math.round(price * 0.1 / 1000.0) * 1000;
            order.setShippingFee(shippingFee);

            order.setTotal(price + shippingFee);

            orderRepository.save(order);

            return ResponseData.success("Add new temperature order successfully", order);

        }catch (Exception e){
            return ResponseData.error(e.getMessage());
        }
    }
}
