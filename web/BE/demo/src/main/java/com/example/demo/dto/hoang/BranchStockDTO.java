package com.example.demo.dto.hoang;

import com.example.demo.entity.Branch;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BranchStockDTO {
    Branch branch;
    Long stock;

    public BranchStockDTO(Branch branch, Long stock) {
        this.branch = branch;
        this.stock = stock;
    }
}
