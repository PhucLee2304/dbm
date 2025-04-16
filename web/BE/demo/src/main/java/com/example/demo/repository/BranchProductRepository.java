package com.example.demo.repository;

import com.example.demo.entity.BranchProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchProductRepository extends JpaRepository<BranchProduct, Long> {
    @Query("SELECT bp FROM BranchProduct bp WHERE bp.keyBranchProduct.branch_id = :branchId AND bp.keyBranchProduct.product_id = :productId")
    Optional<BranchProduct> findByBranchIdAndProductId(@Param("branchId") Long branchId, @Param("productId") Long productId);

    @Query("SELECT bp FROM BranchProduct bp WHERE bp.keyBranchProduct.branch_id = :branchId")
    List<BranchProduct> findByBranchId(@Param("branchId") Long branchId);

    @Query("SELECT bp FROM BranchProduct bp WHERE bp.keyBranchProduct.product_id = :productId")
    List<BranchProduct> findByProductId(@Param("productId") Long productId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BranchProduct bp WHERE bp.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
