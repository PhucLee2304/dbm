package com.example.demo.request.hoang;

import java.util.Map;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

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
