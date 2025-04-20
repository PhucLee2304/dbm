package com.example.demo.entity;

import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "order_online")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderOnline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    Order order;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    Customer customer;

    @Column(nullable = false)
    String recipientName;

    @Column(nullable = false)
    String recipientPhone;

    @Column(nullable = false)
    String recipientAddress;

    String note;
}
