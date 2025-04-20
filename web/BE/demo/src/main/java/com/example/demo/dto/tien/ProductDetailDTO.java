package com.example.demo.dto.tien;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDetailDTO {
    Long id;
    String name;
    Double price;
    String categoryName;
    String supplierName;
    Long stock;
}
