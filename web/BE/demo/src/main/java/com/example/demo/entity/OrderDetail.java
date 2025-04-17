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
@Table(name = "order_detail")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderDetail {
    @EmbeddedId
    KeyOrderDetail keyOrderDetail;

    @ManyToOne
    @JoinColumn(insertable = false, updatable = false)
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    Order order;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
//    @JoinColumn(insertable = false, updatable = false)
//    @JoinColumn(name = "branch_product_id", insertable = false, updatable = false)
    @JoinColumns({
            @JoinColumn(name = "branch_id", referencedColumnName = "branch_id", insertable = false, updatable = false),
            @JoinColumn(name = "product_id", referencedColumnName = "product_id", insertable = false, updatable = false)
    })
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
