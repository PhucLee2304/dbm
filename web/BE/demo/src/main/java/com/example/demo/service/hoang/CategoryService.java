package com.example.demo.service.hoang;

import com.example.demo.entity.Category;
import com.example.demo.interfaces.hoang.CategoryInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.request.hoang.AddCategoryRequest;
import com.example.demo.utils.ResponseData;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
// constructor for all final args, simultaneously use dependence injection constructor for all final fields
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CategoryService implements CategoryInterface {

    CategoryRepository categoryRepository;

    @Override
    public ResponseData addCategory(AddCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            return ResponseData.error("Category already exists with name: " + request.getName());
        }
        Category category = new Category();
        category.setName(request.getName());
        try {
            categoryRepository.save(category);
            return ResponseData.success("Saved new category", category);
        } catch (Exception e) {
            log.error("Error saving category: {}", e.getMessage());
            return ResponseData.error("Failed to save category: " + e.getMessage());
        }
    }

    @Override
    public ResponseData updateCategory(AddCategoryRequest request) {
        return null;
    }

    @Override
    public ResponseData getAllCategories() {
        try {
            return ResponseData.success("Fetched all categories", categoryRepository.findAll());
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            return ResponseData.error("Failed to fetch categories: " + e.getMessage());
        }
    }
}
