package com.example.demo.dto.hoang;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDTO {
    Long id;
    Long categoryId;
    Long supplierId;
    String name;
    double price;
    List<BranchStockDTO> branchStockDTOList;
}
