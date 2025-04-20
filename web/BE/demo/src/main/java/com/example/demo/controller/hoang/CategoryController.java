package com.example.demo.controller.hoang;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.request.hoang.UpdateCategoryRequest;
import com.example.demo.utils.ResponseData;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/category")
public class CategoryController {
    private final CategoryInterface categoryInterface;

    public CategoryController(CategoryInterface categoryInterface) {
        this.categoryInterface = categoryInterface;
    }

    @PostMapping("/admin/add")
    public ResponseEntity<?> addCategory(@RequestBody AddCategoryRequest request) {
        log.info("Here" + request.getName());
        ResponseData responseData = categoryInterface.addCategory(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody UpdateCategoryRequest request) {
        ResponseData responseData = categoryInterface.updateCategory(id, request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllCategories() {
        ResponseData responseData = categoryInterface.getAllCategories();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
