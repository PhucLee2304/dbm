package com.example.demo.controller.hoang;

import com.example.demo.entity.Category;
import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.request.hoang.UpdateCategoryRequest;
import com.example.demo.service.hoang.CategoryService;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/category")
public class CategoryController {
//    private final CategoryInterface categoryInterface;
//
//    public CategoryController(CategoryInterface categoryInterface) {
//        this.categoryInterface = categoryInterface;
//    }
    @Autowired
    CategoryInterface categoryInterface;

    @PostMapping("/create")
    public ResponseEntity<?> create (@RequestBody AddCategoryRequest request) {
        ResponseData responseData = categoryInterface.addCategory(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/update")
    public ResponseEntity<?> update (@RequestBody UpdateCategoryRequest request) {
        ResponseData responseData = categoryInterface.updateCategory(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/getAll")
    public ResponseEntity<?> getAll () {
        ResponseData responseData = categoryInterface.getAllCategories();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
