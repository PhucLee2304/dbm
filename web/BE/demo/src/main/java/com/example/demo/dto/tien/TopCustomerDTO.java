package com.example.demo.dto.tien;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TopCustomerDTO {
    Long id;
    String name;
    String email;
    String phone;
    Integer totalOrders;
    Integer totalQuantityBought;
    Double totalSpent;
}
