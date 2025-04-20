package com.example.demo.service.hoang;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Category;
import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.request.hoang.UpdateCategoryRequest;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService implements CategoryInterface {
    private final CategoryRepository categoryRepository;

    @Override
    public ResponseData addCategory(AddCategoryRequest request) {
        try {
            if (categoryRepository.existsByName(request.getName())) {
                return ResponseData.error("Category name already exist");
            }

            Category category = new Category();
            category.setName(request.getName());
            categoryRepository.save(category);

            return ResponseData.success("Add new category successfully", category);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData updateCategory(Long id, UpdateCategoryRequest request) {
        try {
            Optional<Category> optionalCategory = categoryRepository.findById(id);
            if (optionalCategory.isEmpty()) {
                return ResponseData.error("Category not found");
            }
            Category category = optionalCategory.get();

            if (categoryRepository.existsByName(request.getName())) {
                return ResponseData.error("Category name already exist");
            }

            category.setName(request.getName());
            categoryRepository.save(category);

            return ResponseData.success("Update category successfully", category);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                return ResponseData.error("No categories found");
            }

            return ResponseData.success("Fetched all categories successfully", categories);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
