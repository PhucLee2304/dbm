package com.example.demo.service.hoang;

import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.hoang.BranchStockDTO;
import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.entity.*;
import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.repository.*;
import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService implements ProductInterface {
    private final ProductRepository productRepository;
    private final BranchProductRepository branchProductRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;

    private List<ProductDTO> toProductDTOs(List<BranchProduct> branchProducts) {
        Map<Long, ProductDTO> map = new HashMap<>();

        for (BranchProduct branchProduct : branchProducts) {
            Long id = branchProduct.getProduct().getId();
            String categoryName = branchProduct.getProduct().getCategory().getName();
            String supplierName = branchProduct.getProduct().getSupplier().getName();
            String name = branchProduct.getProduct().getName();
            double price = branchProduct.getProduct().getPrice();

            ProductDTO productDTO = map.get(id);
            if (productDTO == null) {
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
    @Transactional
    public ResponseData addProduct(AddProductRequest request) {
        try {
            if (!categoryRepository.existsById(request.getCategoryId())) {
                return ResponseData.error("Category does not exist");
            }

            if (!supplierRepository.existsById(request.getSupplierId())) {
                return ResponseData.error("Supplier does not exist");
            }

            for (Map.Entry<Long, Long> entry : request.getMapBranchStock().entrySet()) {
                Long branchId = entry.getKey();
                if (!branchRepository.existsById(branchId)) {
                    return ResponseData.error("Branch does not exist");
                }
            }

            Product product = new Product();
            product.setCategory(
                    categoryRepository.findById(request.getCategoryId()).get());
            product.setSupplier(
                    supplierRepository.findById(request.getSupplierId()).get());
            product.setName(request.getName());
            product.setPrice(request.getPrice());

            productRepository.save(product);

            List<BranchProduct> branchProducts = new ArrayList<>();
            for (Map.Entry<Long, Long> entry : request.getMapBranchStock().entrySet()) {
                Long branchId = entry.getKey();
                Long stock = entry.getValue();

                BranchProduct branchProduct = new BranchProduct();
                KeyBranchProduct keyBranchProduct = new KeyBranchProduct();
                keyBranchProduct.setBranch_id(branchId);
                keyBranchProduct.setProduct_id(product.getId());
                branchProduct.setKeyBranchProduct(keyBranchProduct);
                branchProduct.setProduct(product);
                branchProduct.setBranch(branchRepository.findById(branchId).get());
                branchProduct.setStock(stock);

                branchProducts.add(branchProduct);
            }

            branchProductRepository.saveAll(branchProducts);

            return ResponseData.success("Add new product successfully", toProductDTOs(branchProducts));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseData updateProduct(Long id, AddProductRequest request) {
        try {
            Optional<Product> productOptional = productRepository.findById(id);
            if (productOptional.isEmpty()) {
                return ResponseData.error("Product does not exist");
            }
            Product product = productOptional.get();

            Optional<Category> categoryOptional = categoryRepository.findById(request.getCategoryId());
            if (categoryOptional.isEmpty()) {
                return ResponseData.error("Category does not exist");
            }

            Optional<Supplier> supplierOptional = supplierRepository.findById(request.getSupplierId());
            if (supplierOptional.isEmpty()) {
                return ResponseData.error("Supplier does not exist");
            }

            Map<BranchProduct, Long> map = new HashMap<>();
            for (Map.Entry<Long, Long> entry : request.getMapBranchStock().entrySet()) {
                Long branchId = entry.getKey();
                Optional<BranchProduct> branchProductOptional =
                        branchProductRepository.findByBranchIdAndProductId(branchId, product.getId());
                if (branchProductOptional.isEmpty()) {
                    return ResponseData.error("Branch Product does not exist");
                }

                map.put(branchProductOptional.get(), entry.getValue());
            }

            product.setCategory(
                    categoryRepository.findById(request.getCategoryId()).get());
            product.setSupplier(
                    supplierRepository.findById(request.getSupplierId()).get());
            product.setName(request.getName());
            product.setPrice(request.getPrice());

            List<BranchProduct> branchProducts = new ArrayList<>();
            for (Map.Entry<BranchProduct, Long> entry : map.entrySet()) {
                BranchProduct branchProduct = entry.getKey();
                Long stock = entry.getValue();
                branchProduct.setStock(stock);

                branchProducts.add(branchProduct);
            }
            branchProductRepository.saveAll(branchProducts);

            return ResponseData.success("Update product successfully", toProductDTOs(branchProducts));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllProducts() {
        try {
            List<BranchProduct> branchProducts = branchProductRepository.findAll();

            List<ProductDTO> productDTOs = toProductDTOs(branchProducts);

            return ResponseData.success("Fetch all products successfully", productDTOs);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseData deleteProduct(Long id) {
        try {
            if (!productRepository.existsById(id)) {
                return ResponseData.error("Product does not exist");
            }

            branchProductRepository.deleteByProductId(id);
            productRepository.deleteProductById(id);

            return ResponseData.success("Deleted product successfully", null);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
