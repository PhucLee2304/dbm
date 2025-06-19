package com.example.demo.interfaces.tien;

import com.example.demo.utils.ResponseData;

public interface CustomerOrderInterface {
    ResponseData getAllCustomerOrders();

    ResponseData getCustomerOrderById(Long id);

    ResponseData cancelOrder(Long id);
}
