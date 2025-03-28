package com.example.demo.request.tien;

import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.dto.tien.HomeProductDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerHomePageService implements CustomerHomePageInterface {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

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

    @Override
    public ResponseData getRandomProduct(int quantity) {
        try {
            ArrayList<HomeProductDTO> listProducts = productRepository.getRandomProductByBranchAddress(quantity);
            if (listProducts.isEmpty()) {
                return ResponseData.success("No product available for ONLINE branch", null);
            }
            return ResponseData.success("Fetched random products successfully", listProducts);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

}
