package com.example.demo.dto.tien;

import java.util.Date;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class EachDayRevenueLastMonthDTO {
    Integer year;
    Integer month;
    Integer day;
    Date orderDate;
    Integer totalOrders;
    Double dailyRevenue;
}
