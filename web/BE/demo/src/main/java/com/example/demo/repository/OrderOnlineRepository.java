package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.OrderOnline;

@Repository
public interface OrderOnlineRepository extends JpaRepository<OrderOnline, Long> {
    @Query("SELECT oo FROM OrderOnline oo WHERE oo.order.id = :orderId")
    Optional<OrderOnline> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT oo FROM OrderOnline oo WHERE oo.order.id = :orderId")
    List<OrderOnline> findAllByOrderId(@Param("orderId") Long orderId);
}
