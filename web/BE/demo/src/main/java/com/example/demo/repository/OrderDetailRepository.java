package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.KeyOrderDetail;
import com.example.demo.entity.OrderDetail;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, KeyOrderDetail> {
    @Query("SELECT od FROM OrderDetail od WHERE od.keyOrderDetail.order_id = :orderId")
    List<OrderDetail> findAllByOrderId(@Param("orderId") Long orderId);
}
