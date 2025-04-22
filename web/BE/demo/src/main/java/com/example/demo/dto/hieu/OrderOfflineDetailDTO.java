package com.example.demo.dto.hieu;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderOfflineDetailDTO {
    String productName;
    int quantity;
}
