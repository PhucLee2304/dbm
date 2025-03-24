package com.example.demo.request.hoang;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddProductRequest {
    Long categoryId;
    Long supplierId;
    String name;
    double price;
    Map<Long, Long> mapBranchStock;
}
