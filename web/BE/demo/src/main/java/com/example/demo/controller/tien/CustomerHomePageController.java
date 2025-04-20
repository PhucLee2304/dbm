package com.example.demo.controller.tien;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.utils.ResponseData;

@RestController
@RequestMapping("/home")
public class CustomerHomePageController {
    private final CustomerHomePageInterface customerHomePageInterface;
    //    private final ProductDetailInterface productDetailInterface;

    @Autowired
    //    public CustomerHomePageController(CustomerHomePageInterface customerHomePageInterface, ProductDetailInterface
    // productDetailInterface) {
    public CustomerHomePageController(CustomerHomePageInterface customerHomePageInterface) {

        this.customerHomePageInterface = customerHomePageInterface;
        //        this.productDetailInterface = productDetailInterface;
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

    //    @GetMapping("/public/product/detail")
    //    public ResponseEntity<?> getProductDetail(@RequestParam Long id) {
    //        ResponseData responseData = productDetailInterface.getProductDetail(id);
    //        return new ResponseEntity<>(responseData, HttpStatus.OK);
    //    }

    @GetMapping("/public/product/{id}")
    public ResponseEntity<?> findProductById(@PathVariable Long id) {
        ResponseData responseData = customerHomePageInterface.findProductById(id);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/public/product/search")
    public ResponseEntity<?> getProductSearch(@RequestParam("keyword") String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ResponseEntity<>(ResponseData.error("Keyword must not be empty"), HttpStatus.BAD_REQUEST);
        }
        ResponseData responseData = customerHomePageInterface.getProductByKeyword(keyword);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
