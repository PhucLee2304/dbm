package com.example.demo.repository;

import com.example.demo.entity.OrderOnline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderOnlineRepository extends JpaRepository<OrderOnline, Long> {
}
