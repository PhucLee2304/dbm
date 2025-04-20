package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "product")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "category_id")
    Category category;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = true)
    Supplier supplier;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    @Min(0)
    double price;
}
