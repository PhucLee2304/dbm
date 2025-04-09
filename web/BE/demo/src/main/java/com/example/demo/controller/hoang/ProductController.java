package com.example.demo.controller.hoang;

import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/product/admin")
public class ProductController {
    private final ProductInterface productInterface;

    @Autowired
    public ProductController(ProductInterface productInterface) {
        this.productInterface = productInterface;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProducts() {
        ResponseData responseData = productInterface.getAllProducts();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
