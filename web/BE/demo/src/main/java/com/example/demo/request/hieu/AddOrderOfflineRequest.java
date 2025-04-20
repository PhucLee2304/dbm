package com.example.demo.request.hieu;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddOrderOfflineRequest {
    List<Map<Long, Integer>> items;
}
