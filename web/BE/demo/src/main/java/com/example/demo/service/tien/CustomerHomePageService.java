package com.example.demo.service.tien;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dto.tien.ProductDetailDTO;
import com.example.demo.entity.Category;
import com.example.demo.interfaces.tien.CustomerHomePageInterface;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerHomePageService implements CustomerHomePageInterface {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    //    private final BranchProductRepository branchProductRepository;

    @Override
    public ResponseData getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            if (categories.isEmpty()) {
                return ResponseData.success("Chưa có danh mục nào được tạo", null);
            }

            return ResponseData.success("Lấy danh sách danh mục thành công", categories);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getRandomProduct() {
        try {
            List<ProductDetailDTO> products = productRepository.findAllProductOnBranchOnline();
            if (products.isEmpty()) {
                return ResponseData.success("Chưa có sản phẩm nào được tạo", null);
            }

            Collections.shuffle(products);
            List<ProductDetailDTO> randomProducts = products.stream().limit(100).toList();

            return ResponseData.success("Lấy sản phẩm ngẫu nhiên thành công", randomProducts);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData findProductById(Long id) {
        try {
            //            Optional<BranchProduct> branchProductOptional =
            // branchProductRepository.findByBranchIdAndProductId(1L, id);
            //            if (branchProductOptional.isEmpty()) {
            //                return ResponseData.error("No branch product created yet");
            //            }
            //
            //            return ResponseData.success("Fetched product successfully",
            // toProductDetailDTO(branchProductOptional.get()));

            Optional<ProductDetailDTO> productOptional = productRepository.findProductByIdOnBranchOnline(id);
            if (productOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy sản phẩm");
            }

            return ResponseData.success("Lấy thông tin sản phẩm thành công", productOptional.get());

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    //    private ProductDetailDTO toProductDetailDTO(BranchProduct branchProduct) {
    //        ProductDetailDTO productDetailDTO = new ProductDetailDTO();
    //        productDetailDTO.setStock(branchProduct.getStock());
    //        productDetailDTO.setName(branchProduct.getProduct().getName());
    //        productDetailDTO.setPrice(branchProduct.getProduct().getPrice());
    //        productDetailDTO.setCategoryName(branchProduct.getProduct().getCategory().getName());
    //        productDetailDTO.setSupplierName(branchProduct.getProduct().getSupplier().getName());
    //        return productDetailDTO;
    //    }

    @Override
    public ResponseData getProductByKeyword(String keyword) {
        try {
            List<ProductDetailDTO> products = productRepository.findByNameContainingIgnoreCaseOnBranchOnline(keyword);
            if (products.isEmpty()) {
                return ResponseData.success("Không tìm thấy sản phẩm nào với từ khóa đã cho", null);
            }

            Collections.shuffle(products);
            List<ProductDetailDTO> randomProducts = products.stream().limit(100).toList();

            return ResponseData.success("Lấy sản phẩm thành công", randomProducts);
            //            List<Product> randomProducts = products.stream()
            //                    .limit(100)
            //                    .toList();
            //
            //            List<ProductDetailDTO> productDetailDTOs = randomProducts.stream()
            //                    .map(this::c)

            //            List<HomeProductDTO> productDTOs = hundredProducts.stream()
            //                    .map(product -> {
            //                        HomeProductDTO dto = new HomeProductDTO();
            //                        dto.setCategoryName(product.getCategory().getName());
            //                        dto.setName(product.getName());
            //                        dto.setPrice(product.getPrice());
            //                        return dto;
            //                    })
            //                    .toList();
            //
            //            return ResponseData.success("Fetched products successfully", productDTOs);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    //    private HomeProductDTO convertToHomeProductDTO(BranchProduct branchProduct) {
    //        HomeProductDTO dto = new HomeProductDTO();
    //        dto.setCategoryName(branchProduct.getProduct().getCategory().getName());
    //        dto.setName(branchProduct.getProduct().getName());
    //        dto.setPrice(branchProduct.getProduct().getPrice());
    //
    //        return dto;
    //    }
}
