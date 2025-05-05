package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.OrderOffline;

@Repository
public interface OrderOfflineRepository extends JpaRepository<OrderOffline, Long> {
    @Query("SELECT oo FROM OrderOffline oo WHERE oo.order.id = :orderId")
    Optional<OrderOffline> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT oo FROM OrderOffline oo WHERE oo.order.id = :orderId")
    List<OrderOffline> findAllByOrderId(@Param("orderId") Long orderId);
}
