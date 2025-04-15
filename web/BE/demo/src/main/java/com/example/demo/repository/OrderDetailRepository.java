package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.OrderDetail;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM OrderDetail od WHERE od.keyOrderDetail.branch_id = :branchId AND od.keyOrderDetail.product_id = :productId")
    void deleteByBranchIdAndProductId(@Param("branchId") Long branchId, @Param("productId") Long productId);
}
