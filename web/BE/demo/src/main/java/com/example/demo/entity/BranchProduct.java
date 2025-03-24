package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "branch_product")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BranchProduct {
    @EmbeddedId
    KeyBranchProduct keyBranchProduct;

    @ManyToOne
    @JoinColumn(name = "branch_id", insertable = false, updatable = false)
    @JsonBackReference
    Branch branch;

    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    Product product;

    @Column(nullable = false)
    @Min(0)
    Long stock;
}
