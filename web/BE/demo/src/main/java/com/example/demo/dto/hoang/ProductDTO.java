package com.example.demo.dto.hoang;

import java.util.List;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDTO {
    Long id;
    String categoryName;
    String supplierName;
    String name;
    double price;
    List<BranchStockDTO> branchStockDTOs;

    public ProductDTO(
            Long id,
            String categoryName,
            String supplierName,
            String name,
            double price,
            List<BranchStockDTO> branchStockDTOs) {
        this.id = id;
        this.categoryName = categoryName;
        this.supplierName = supplierName;
        this.name = name;
        this.price = price;
        this.branchStockDTOs = branchStockDTOs;
    }
}
