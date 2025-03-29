package com.example.demo.controller.tien;

import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.interfaces.tien.ProductDetailInterface;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class CustomerHomePageController {
    private final CustomerHomePageInterface customerHomePageInterface;
    private final ProductDetailInterface productDetailInterface;

    @Autowired
    public CustomerHomePageController(CustomerHomePageInterface customerHomePageInterface, ProductDetailInterface productDetailInterface) {
        this.customerHomePageInterface = customerHomePageInterface;
        this.productDetailInterface = productDetailInterface;
    }

    @GetMapping("/public/category/all")
    public ResponseEntity<?> getAllCategories() {
        ResponseData responseData = customerHomePageInterface.getAllCategories();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/public/product/random")
    public ResponseEntity<?> getRandomProduct() {
        ResponseData responseData = customerHomePageInterface.getRandomProduct();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/public/product/detail")
    public ResponseEntity<?> getProductDetail(@RequestParam Long id) {
        ResponseData responseData = productDetailInterface.getProductDetail(id);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
