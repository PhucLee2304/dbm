package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.OrderDetail;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
}
