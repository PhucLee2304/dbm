package com.example.demo.service.hoang;

import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.stereotype.Service;

@Service
public class CategoryService implements CategoryInterface {
    @Override
    public ResponseData addCategory(AddCategoryRequest request) {
        return null;
    }

    @Override
    public ResponseData updateCategory(AddCategoryRequest request) {
        return null;
    }

    @Override
    public ResponseData getAllCategories() {
        return null;
    }
}
