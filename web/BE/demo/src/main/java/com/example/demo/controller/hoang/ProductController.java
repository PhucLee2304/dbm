package com.example.demo.controller.hoang;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.utils.ResponseData;

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

    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody AddProductRequest request) {
        ResponseData responseData = productInterface.addProduct(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable("id") Long id, @RequestBody AddProductRequest request) {
        ResponseData responseData = productInterface.updateProduct(id, request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable("id") Long id) {
        ResponseData responseData = productInterface.deleteProduct(id);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
