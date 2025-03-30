package com.example.demo.service.tien;

import com.example.demo.dto.tien.ProductDetailDTO;
import com.example.demo.entity.BranchProduct;
import com.example.demo.interfaces.tien.ProductDetailInterface;
import com.example.demo.repository.BranchProductRepository;
import com.example.demo.utils.ResponseData;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor()
public class ProductDetailService implements ProductDetailInterface {
    BranchProductRepository branchProductRepository;


    @Override
    public ResponseData getProductDetail(Long id) {
        if(id == null || id <= 0)
            return ResponseData.error("Invalid input for id");
        Optional<BranchProduct> branchProductOptional;
        try {
            branchProductOptional = branchProductRepository.findByBranchIdAndProductId(1L, id);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
        if(branchProductOptional.isEmpty())
            return ResponseData.error("Product not found");
        BranchProduct branchProduct = branchProductOptional.get();
        return ResponseData.success("Fetch product detail success", toProductDetailDTO(branchProduct));
    }

    private ProductDetailDTO toProductDetailDTO(BranchProduct branchProduct) {
        ProductDetailDTO productDetailDTO = new ProductDetailDTO();
        productDetailDTO.setStock(branchProduct.getStock());
        productDetailDTO.setName(branchProduct.getProduct().getName());
        productDetailDTO.setPrice(branchProduct.getProduct().getPrice());
        productDetailDTO.setCategoryName(branchProduct.getProduct().getCategory().getName());
        productDetailDTO.setSupplierName(branchProduct.getProduct().getSupplier().getName());
        return productDetailDTO;
    }
}
