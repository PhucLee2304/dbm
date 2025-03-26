package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "order_detail")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetail {
    @EmbeddedId
    KeyOrderDetail keyOrderDetail;

    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    @JsonBackReference
    Order order;

    @ManyToOne
//    @JoinColumn(name = "branch_product_id", insertable = false, updatable = false)
    BranchProduct branchProduct;

    @Column(nullable = false)
    @Min(1)
    int quantity;

    @Column(nullable = false)
    double price;

    public void setKeyOrderDetail(Long id, Long branchId, Long productId) {
        KeyOrderDetail keyOrderDetail = new KeyOrderDetail();
        keyOrderDetail.setOrder_id(id);
        keyOrderDetail.setBranch_id(branchId);
        keyOrderDetail.setProduct_id(productId);

        this.keyOrderDetail = keyOrderDetail;
    }
}
