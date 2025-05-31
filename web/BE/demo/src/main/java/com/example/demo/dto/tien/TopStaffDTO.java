package com.example.demo.dto.tien;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TopStaffDTO {
    Long id;
    String staffCode;
    String staffName;
    Integer totalOrders;
    Integer totalQuantitySold;
    Double totalRevenue;
}
