package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "branch_product")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BranchProduct {
    @EmbeddedId
    KeyBranchProduct keyBranchProduct;

    @ManyToOne
//    @JoinColumn(name = "branch_id", insertable = false)
//    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(insertable = false, updatable = false)
    @JsonBackReference
    Branch branch;

    @ManyToOne
//    @JoinColumn(name = "product_id", insertable = false)
//    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(insertable = false, updatable = false)
    Product product;

    @Column(nullable = false)
    @Min(0)
    Long stock;

//    public void setKeyBranchProduct(Long branchId, Long productId) {
//        KeyBranchProduct keyBranchProduct = new KeyBranchProduct();
//        keyBranchProduct.setBranch_id(branchId);
//        keyBranchProduct.setProduct_id(productId);
//
//        this.keyBranchProduct = keyBranchProduct;
//    }
}
