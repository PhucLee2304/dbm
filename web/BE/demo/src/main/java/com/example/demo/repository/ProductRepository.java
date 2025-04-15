package com.example.demo.repository;

import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.entity.Product;
import com.example.demo.dto.tien.ProductDetailDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("""
        SELECT new com.example.demo.dto.tien.ProductDetailDTO(p.id, p.name, p.price, p.category.name, p.supplier.name, bp.stock)
        FROM Product p 
        JOIN BranchProduct bp ON p.id = bp.keyBranchProduct.product_id 
        WHERE bp.keyBranchProduct.branch_id = 1 AND LOWER(REPLACE(TRIM(p.name), ' ', '')) LIKE LOWER(CONCAT('%', REPLACE(:keyword, ' ', ''), '%'))
    """)
    List<ProductDetailDTO> findByNameContainingIgnoreCaseOnBranchOnline(@Param("keyword") String keyword);

    @Query("""
        SELECT new com.example.demo.dto.tien.ProductDetailDTO(p.id, p.name, p.price, p.category.name, p.supplier.name, bp.stock)
        FROM Product p
        JOIN BranchProduct bp ON p.id = bp.keyBranchProduct.product_id
        WHERE bp.keyBranchProduct.branch_id = 1
    """)
    List<ProductDetailDTO> findAllProductOnBranchOnline();

    @Query("""
        SELECT new com.example.demo.dto.tien.ProductDetailDTO(p.id, p.name, p.price, p.category.name, p.supplier.name, bp.stock)
        FROM Product p
        JOIN BranchProduct bp ON p.id = bp.keyBranchProduct.product_id
        WHERE bp.keyBranchProduct.branch_id = 1 AND p.id = :id
    """)
    Optional<ProductDetailDTO> findProductByIdOnBranchOnline(@Param("id") Long id);

    @Query("""
        SELECT new com.example.demo.dto.tien.ProductDetailDTO(p.id, p.name, p.price, p.category.name, p.supplier.name, bp.stock)
        FROM Product p
        JOIN BranchProduct bp ON p.id = bp.keyBranchProduct.product_id
        WHERE bp.keyBranchProduct.branch_id = :branchId AND LOWER(REPLACE(TRIM(p.name), ' ', '')) LIKE LOWER(CONCAT('%', REPLACE(:keyword, ' ', ''), '%'))
    """)
    List<ProductDetailDTO> findAllProductByBranchId(@Param("branchId") Long branchId, @Param("keyword") String keyword);

    @Modifying
    @Transactional
    @Query("DELETE FROM Product p WHERE p.id = :productId")
    void deleteProductById(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query(value = """
    -- First delete from order_detail
    DELETE FROM order_detail 
    WHERE product_id = :productId;
    
    -- Then delete from branch_product
    DELETE FROM branch_product 
    WHERE product_id = :productId;
    
    -- Finally delete the product
    DELETE FROM product 
    WHERE id = :productId;
    """, nativeQuery = true)
    void deleteProductAndAllReferences(@Param("productId") Long productId);
}
