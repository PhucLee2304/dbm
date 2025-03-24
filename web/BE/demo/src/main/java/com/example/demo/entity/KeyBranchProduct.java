package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class KeyBranchProduct implements Serializable {
    @Column(nullable = false)
    Long branch_id;

    @Column(nullable = false)
    Long product_id;

    @Override
    public boolean equals(Object obj) {
        if(this == obj) return true;
        if(obj == null || getClass() != obj.getClass()) return false;
        KeyBranchProduct that = (KeyBranchProduct)obj;
        return branch_id == that.branch_id && product_id == that.product_id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(branch_id, product_id);
    }
}
