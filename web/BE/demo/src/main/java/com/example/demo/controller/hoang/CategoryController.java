package com.example.demo.controller.hoang;

import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.utils.ResponseData;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryController {
    private final CategoryInterface categoryInterface;

    public CategoryController(CategoryInterface categoryInterface) {
        this.categoryInterface = categoryInterface;
    }

    @PostMapping("/add_category")
    public ResponseEntity<?> addCategory(@Valid @RequestBody AddCategoryRequest request) {
        try {
            ResponseData responseData = categoryInterface.addCategory(request);
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(ResponseData.error("Failed to add category: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
