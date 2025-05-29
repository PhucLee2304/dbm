package com.example.demo.service.tien;

import com.example.demo.dto.tien.TopProductDTO;
import com.example.demo.interfaces.tien.AttendanceInterface;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public ResponseData getTotalRevenue() {
        return ResponseData.success("Total Revenue", orderRepository.getTotalRevenue());
    }

    public ResponseData getTopProducts() {

        List<Object[]> queryResults = productRepository.findTopProductRaw();
        List<TopProductDTO> result = queryResults.stream()
                .map(row -> new TopProductDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).intValue(),
                        ((Number) row[3]).doubleValue()
                ))
                .collect(Collectors.toList());
        return ResponseData.success("Top Products", result);
    }

}
