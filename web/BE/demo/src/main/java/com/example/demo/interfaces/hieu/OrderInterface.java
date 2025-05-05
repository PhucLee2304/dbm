package com.example.demo.interfaces.hieu;

import com.example.demo.request.hieu.AddOrderOfflineRequest;
import com.example.demo.request.hieu.PrepareOrderOnlineRequest;
import com.example.demo.utils.ResponseData;

public interface OrderInterface {
    ResponseData prepareOrderOnline(PrepareOrderOnlineRequest request);

    ResponseData updateOrderOnline(Long id);

    ResponseData cancelOrder(Long id);

    ResponseData getProductByKeyword(String keyword);

    ResponseData addOrderOffline(AddOrderOfflineRequest request);

    ResponseData getAllOrders();

    ResponseData getOrderById(Long id);
}
