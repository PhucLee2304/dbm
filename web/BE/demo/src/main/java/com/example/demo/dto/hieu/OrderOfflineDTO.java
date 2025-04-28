package com.example.demo.dto.hieu;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderOfflineDTO {
    Long orderId;
    double subTotal;
    double shippingFee;
    double total;
    LocalDateTime created;
    String staffCode;
    String branchName;
    List<OrderOfflineDetailDTO> details;
}
