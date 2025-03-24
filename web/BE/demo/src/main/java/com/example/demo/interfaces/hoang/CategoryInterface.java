package com.example.demo.interfaces.hoang;

import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.utils.ResponseData;

public interface CategoryInterface {
    ResponseData addCategory(AddCategoryRequest request);
    ResponseData updateCategory(AddCategoryRequest request);
    ResponseData getAllCategories();
}
