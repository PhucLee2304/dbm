package com.example.demo.service.hoang;

import com.example.demo.dto.hoang.BranchStockDTO;
import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.entity.Branch;
import com.example.demo.entity.BranchProduct;
import com.example.demo.entity.Product;
import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.repository.BranchProductRepository;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService implements ProductInterface {
    private final ProductRepository productRepository;
    private final BranchProductRepository branchProductRepository;
    private final CategoryRepository categoryRepository;

    private List<ProductDTO> toProductDTOs(List<BranchProduct> branchProducts) {
        Map<Long, ProductDTO> map = new HashMap<>();

        for(BranchProduct branchProduct : branchProducts) {
            Long id = branchProduct.getProduct().getId();
            String categoryName = branchProduct.getProduct().getCategory().getName();
            String supplierName = branchProduct.getProduct().getSupplier().getName();
            String name = branchProduct.getProduct().getName();
            double price = branchProduct.getProduct().getPrice();

            ProductDTO productDTO = map.get(id);
            if(productDTO == null) {
                productDTO = new ProductDTO(id, categoryName, supplierName, name, price, new ArrayList<>());
                map.put(id, productDTO);
            }

            Branch branch = branchProduct.getBranch();
            Long stock = branchProduct.getStock();
            BranchStockDTO branchStockDTO = new BranchStockDTO(branch, stock);
            productDTO.getBranchStockDTOs().add(branchStockDTO);
        }

        return new ArrayList<>(map.values());
    }

    @Override
    public ResponseData addProduct(AddProductRequest request) {
        return null;
    }

    @Override
    public ResponseData updateProduct(AddProductRequest request) {
        return null;
    }

    @Override
    public ResponseData getAllProducts() {
        try{
            List<BranchProduct> branchProducts = branchProductRepository.findAll();

            List<ProductDTO> productDTOs = toProductDTOs(branchProducts);

            return ResponseData.success("Fetch all products successfully", productDTOs);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData deleteProduct(Long id) {
        return null;
    }
}
