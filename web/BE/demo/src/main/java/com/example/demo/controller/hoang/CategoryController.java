package com.example.demo.controller.hoang;

import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryController {
    private final CategoryInterface categoryInterface;

    public CategoryController(CategoryInterface categoryInterface) {
        this.categoryInterface = categoryInterface;
    }

    @PostMapping("/admin/add")
    public ResponseEntity<?> addCategory(AddCategoryRequest request) {
        ResponseData responseData = categoryInterface.addCategory(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
