package com.example.demo.controller.hoang;

import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.request.hoang.UpdateProductRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product")
public class ProductController {
    private final ProductInterface productInterface;

    public ProductController(ProductInterface productInterface) {
        this.productInterface = productInterface;
    }

    @PostMapping("/admin/add")
    public ResponseEntity<?> addProduct(AddProductRequest request) {
        ResponseData responseData = productInterface.addProduct(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
        ResponseData responseData = productInterface.updateProduct(id, request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllCategories() {
        ResponseData responseData = productInterface.getAllCategories();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
