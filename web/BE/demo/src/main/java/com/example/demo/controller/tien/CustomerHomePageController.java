package com.example.demo.controller.tien;

import com.example.demo.interfaces.tien.CustomerHomePageInterface;
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

    @Autowired
    public CustomerHomePageController(CustomerHomePageInterface customerHomePageInterface) {
        this.customerHomePageInterface = customerHomePageInterface;
    }

    @GetMapping("/public/category/all")
    public ResponseEntity<?> getAllCategories() {
        ResponseData responseData =customerHomePageInterface.getAllCategories();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/public/product/random")
    public ResponseEntity<?> getRandomProduct(@RequestParam int quantity) {
        return new ResponseEntity<>(customerHomePageInterface.getRandomProduct(quantity), HttpStatus.OK);
    }

}
