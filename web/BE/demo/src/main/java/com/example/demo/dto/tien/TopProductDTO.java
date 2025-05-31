package com.example.demo.dto.tien;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TopProductDTO {
    Long id;
    String name;
    Integer totalQuantitySold;
    Double totalRevenue;
}
