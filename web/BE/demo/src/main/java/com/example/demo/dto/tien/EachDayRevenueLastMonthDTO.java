package com.example.demo.dto.tien;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

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
