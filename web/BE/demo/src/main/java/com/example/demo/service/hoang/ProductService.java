package com.example.demo.service.hoang;

import com.example.demo.entity.Product;
import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.repository.ProductRepository;
import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.request.hoang.UpdateProductRequest;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService implements ProductInterface {
    private final ProductRepository productRepository;

    @Override
    public ResponseData addProduct(AddProductRequest request) {
        try{
            if(productRepository.existsByName(request.getName())){
                return ResponseData.error("Product name already exist");
            }

            Product product = new Product();
            product.setName(request.getName());
            productRepository.save(product);

            return ResponseData.success("Add new product successfully", product);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData updateProduct(Long id, UpdateProductRequest request) {
        try{
            Optional<Product> optionalProduct = productRepository.findById(id);
            if(optionalProduct.isEmpty()){
                return ResponseData.error("Product not found");
            }
            Product product = optionalProduct.get();

            if(productRepository.existsByName(product.getName())){
                return ResponseData.error("Product name already exist");
            }

            product.setName(request.getName());
            productRepository.save(product);

            return ResponseData.success("Update product successfully", product);
        }catch (Exception e){
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllCategories() {
        try{
            List<Product> categories = productRepository.findAll();
            if(categories.isEmpty()){
                return ResponseData.error("No categories found");
            }

            return ResponseData.success("Fetched all categories successfully", categories);
        }catch (Exception e){
            return ResponseData.error(e.getMessage());
        }
    }
}
