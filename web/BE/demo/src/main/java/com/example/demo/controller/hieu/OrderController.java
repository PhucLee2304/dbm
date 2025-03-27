package com.example.demo.controller.hieu;

import com.example.demo.interfaces.hieu.OrderInterface;
import com.example.demo.request.hieu.AddOrderOfflineRequest;
import com.example.demo.request.hieu.PrepareOrderOnlineRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/order")
public class OrderController {
    private final OrderInterface orderInterface;

    @Autowired
    public OrderController(OrderInterface orderInterface) {
        this.orderInterface = orderInterface;
    }

    @PostMapping("/add/temp")
    public ResponseEntity<?> prepareOrderOnline(@RequestBody PrepareOrderOnlineRequest request) {
        ResponseData responseData = orderInterface.prepareOrderOnline(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/staff/add")
    public ResponseEntity<?> addOrderOffline(@RequestBody AddOrderOfflineRequest request) {
        ResponseData responseData = orderInterface.addOfflineOrder(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
