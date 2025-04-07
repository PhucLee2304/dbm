package com.example.demo.request.tien;

import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.dto.tien.HomeProductDTO;
import com.example.demo.entity.BranchProduct;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.repository.BranchProductRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerHomePageService implements CustomerHomePageInterface {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final BranchProductRepository branchProductRepository;

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
    public ResponseData getRandomProduct() {
        try {
//            ArrayList<HomeProductDTO> listProducts = productRepository.getRandomProductByBranchAddress(quantity);
//            if (listProducts.isEmpty()) {
//                return ResponseData.success("No product available for ONLINE branch", null);
//            }
//            return ResponseData.success("Fetched random products successfully", listProducts);
            List<BranchProduct> branchProducts = branchProductRepository.findByBranchId(1L);
            if (branchProducts.isEmpty()) {
                return ResponseData.error("No branch products created yet");
            }
            Collections.shuffle(branchProducts);
            List<BranchProduct> randomProducts = branchProducts.stream()
                    .limit(100)
                    .toList();

            List<HomeProductDTO> homeProductDTOs = randomProducts.stream()
                    .map(this::convertToHomeProductDTO)
                    .toList();

            return ResponseData.success("Fetched random product successfully", homeProductDTOs);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getProductByKeyword(String keyword) {
        try {
            List<Product> products = productRepository.findByNameContainingIgnoreCaseAndBranchId(keyword);
            if (products.isEmpty()) {
                return ResponseData.success("No products found with the given keyword for branch ID 1", null);
            }
            Collections.shuffle(products);
            List<Product> hundredProducts = products.stream()
                    .limit(100)
                    .toList();

            List<HomeProductDTO> productDTOs = hundredProducts.stream()
                    .map(product -> {
                        HomeProductDTO dto = new HomeProductDTO();
                        dto.setCategoryName(product.getCategory().getName());
                        dto.setName(product.getName());
                        dto.setPrice(product.getPrice());
                        return dto;
                    })
                    .toList();

            return ResponseData.success("Fetched products successfully", productDTOs);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    private HomeProductDTO convertToHomeProductDTO(BranchProduct branchProduct) {
        HomeProductDTO dto = new HomeProductDTO();
        dto.setCategoryName(branchProduct.getProduct().getCategory().getName());
        dto.setName(branchProduct.getProduct().getName());
        dto.setPrice(branchProduct.getProduct().getPrice());

        return dto;
    }
}
