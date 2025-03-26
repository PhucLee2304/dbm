package com.example.demo.request.hieu;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PrepareOrderOnlineRequest {
    Long productId;
    int quantity;
}
