package com.example.demo.service.hoang;

import com.example.demo.entity.Category;
import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.request.hoang.UpdateCategoryRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService implements CategoryInterface {
    @Autowired
    CategoryRepository categoryRepository;
    @Override
    public ResponseData addCategory(AddCategoryRequest request) {
        Category category =new Category();
        category.setName(request.getName());
        category = categoryRepository.save(category);
        return ResponseData.success("OK", category);
    }

    @Override
    public ResponseData updateCategory(UpdateCategoryRequest request) {
        categoryRepository.updateCategoryName(request.getNewName(), request.getName());
        return ResponseData.success("OK",null);
    }

    @Override
    public ResponseData getAllCategories() {
        List<Category> categoryList = categoryRepository.findAll();
        return ResponseData.success("OK",categoryList);
    }
}
