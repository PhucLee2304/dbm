package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.OrderOffline;

@Repository
public interface OrderOfflineRepository extends JpaRepository<OrderOffline, Long> {}
