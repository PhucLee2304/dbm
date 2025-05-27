package com.example.demo.service.tien;

import com.example.demo.interfaces.tien.AttendanceInterface;
import com.example.demo.repository.OrderRepository;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class DashboardService {
    private final OrderRepository orderRepository;

    public ResponseData getTotalRevenue() {
        return ResponseData.success("Total Revenue", orderRepository.getTotalRevenue());
    }
}
