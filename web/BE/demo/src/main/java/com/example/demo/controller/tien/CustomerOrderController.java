package com.example.demo.controller.tien;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.interfaces.tien.CustomerOrderInterface;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {
    private final CustomerOrderInterface customerOrderService;

    @GetMapping
    public ResponseData getAllCustomerOrders() {
        return customerOrderService.getAllCustomerOrders();
    }

    @GetMapping("/{id}")
    public ResponseData getCustomerOrderById(@PathVariable Long id) {
        return customerOrderService.getCustomerOrderById(id);
    }

    @PostMapping("/{id}/cancel")
    public ResponseData cancelOrder(@PathVariable Long id) {
        return customerOrderService.cancelOrder(id);
    }
}
