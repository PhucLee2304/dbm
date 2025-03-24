package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.Objects;

@Embeddable
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class KeyOrderDetail {
    @Column(nullable = false)
    Long order_id;

    @Column(nullable = false)
    Long branch_product_id;

    @Override
    public boolean equals(Object obj) {
        if(this == obj) return true;
        if(obj == null || getClass() != obj.getClass()) return false;
        KeyOrderDetail that = (KeyOrderDetail) obj;
        return order_id == that.order_id && branch_product_id == that.branch_product_id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(order_id, branch_product_id);
    }
}
