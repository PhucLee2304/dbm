package com.example.demo.request.tien;

import com.example.demo.entity.Category;
import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerHomePageService implements CustomerHomePageInterface {
    private final CategoryRepository categoryRepository;

    @Override
    public ResponseData getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                return ResponseData.success("No categories created yet", null);
            }

            return ResponseData.success("Fetched all categories successfully", categories);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
