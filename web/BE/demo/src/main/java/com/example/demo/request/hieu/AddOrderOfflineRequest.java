package com.example.demo.request.hieu;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class AddOrderOfflineRequest {
    List<Map<Long, Integer>> items;
}
