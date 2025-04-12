package com.example.demo.service.hoang;

import com.example.demo.dto.hoang.BranchStockDTO;
import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.entity.Branch;
import com.example.demo.entity.BranchProduct;
import com.example.demo.entity.KeyBranchProduct;
import com.example.demo.entity.Product;
import com.example.demo.interfaces.hoang.ProductInterface;
import com.example.demo.repository.*;
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
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;

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
        try{
            if(!categoryRepository.existsById(request.getCategoryId())) {
                return ResponseData.error("Category does not exist");
            }

            if(!supplierRepository.existsById(request.getSupplierId())) {
                return ResponseData.error("Supplier does not exist");
            }

            for(Map.Entry<Long, Long> entry: request.getMapBranchStock().entrySet()){
                Long branchId = entry.getKey();
//                log.info("Here");
                if(!branchRepository.existsById(branchId)) {
                    return ResponseData.error("Branch does not exist");
                }
            }

            Product product = new Product();
            product.setCategory(categoryRepository.findById(request.getCategoryId()).get());
            product.setSupplier(supplierRepository.findById(request.getSupplierId()).get());
            product.setName(request.getName());
            product.setPrice(request.getPrice());

            productRepository.save(product);

            List<BranchProduct> branchProducts = new ArrayList<>();
            for(Map.Entry<Long, Long> entry: request.getMapBranchStock().entrySet()){
                Long branchId = entry.getKey();
                Long stock = entry.getValue();

                BranchProduct branchProduct = new BranchProduct();
//                branchProduct.setKeyBranchProduct(branchId, product.getId());
                KeyBranchProduct keyBranchProduct = new KeyBranchProduct();
                keyBranchProduct.setBranch_id(branchId);
                keyBranchProduct.setProduct_id(product.getId());
                branchProduct.setKeyBranchProduct(keyBranchProduct);
                branchProduct.setProduct(product);
                branchProduct.setBranch(branchRepository.findById(branchId).get());
                branchProduct.setStock(stock);

//                branchProductRepository.save(branchProduct);
                branchProducts.add(branchProduct);
            }

            branchProductRepository.saveAll(branchProducts);

            return ResponseData.success("Add new product successfully", toProductDTOs(branchProducts));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
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
