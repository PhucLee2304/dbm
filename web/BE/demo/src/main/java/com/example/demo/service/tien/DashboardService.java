package com.example.demo.service.tien;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.tien.EachDayRevenueLastMonthDTO;
import com.example.demo.dto.tien.TopCustomerDTO;
import com.example.demo.dto.tien.TopProductDTO;
import com.example.demo.dto.tien.TopStaffDTO;
import com.example.demo.repository.OrderRepository;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepository orderRepository;

    public ResponseData getTotalRevenue() {
        return ResponseData.success("Tổng doanh thu", orderRepository.getTotalRevenue());
    }

    public ResponseData getTopProducts() {
        List<Object[]> queryResults = orderRepository.findTopProductRaw();
        List<TopProductDTO> result = queryResults.stream()
                .map(row -> new TopProductDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).intValue(),
                        ((Number) row[3]).doubleValue()))
                .collect(Collectors.toList());
        return ResponseData.success("Lấy danh sách sản phẩm bán chạy thành công", result);
    }

    public ResponseData getTopStaff() {
        List<Object[]> queryResults = orderRepository.findTopStaffRaw();
        List<TopStaffDTO> result = queryResults.stream()
                .map(row -> new TopStaffDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).intValue(),
                        ((Number) row[4]).intValue(),
                        ((Number) row[5]).doubleValue()))
                .collect(Collectors.toList());
        return ResponseData.success("Lấy danh sách nhân viên xuất sắc thành công", result);
    }

    public ResponseData getTopCustomer() {
        List<Object[]> queryResults = orderRepository.findTopCustomerRaw();
        List<TopCustomerDTO> result = queryResults.stream()
                .map(row -> new TopCustomerDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((String) row[3]),
                        ((Number) row[4]).intValue(),
                        ((Number) row[5]).intValue(),
                        ((Number) row[6]).doubleValue()))
                .collect(Collectors.toList());
        return ResponseData.success("Lấy danh sách khách hàng VIP thành công", result);
    }

    public ResponseData getEachDayRevenueLastMonth() {
        List<Object[]> queryResults = orderRepository.getEachDayRevenueLastMonthRaw();
        List<EachDayRevenueLastMonthDTO> result = queryResults.stream()
                .map(row -> new EachDayRevenueLastMonthDTO(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).intValue(),
                        ((Date) row[3]),
                        ((Number) row[4]).intValue(),
                        ((Number) row[5]).doubleValue()))
                .collect(Collectors.toList());
        return ResponseData.success("Lấy doanh thu theo ngày tháng trước thành công", result);
    }

    public ResponseData getTotalUsers() {
        Long queryResults = orderRepository.getTotalUsers();
        return ResponseData.success("Lấy tổng số người dùng", queryResults);
    }

    public ResponseData getTotalCustomers() {
        Long queryResults = orderRepository.getTotalCustomers();
        return ResponseData.success("Lấy tổng số khách hàng", queryResults);
    }

    public ResponseData getTotalStaffs() {
        Long queryResults = orderRepository.getTotalStaffs();
        return ResponseData.success("Lấy tổng số nhân viên", queryResults);
    }

    public ResponseData getTotalOrders() {
        Long queryResults = orderRepository.getTotalOrders();
        return ResponseData.success("Lấy tổng số đơn hàng", queryResults);
    }

    public ResponseData getTotalOnlineOrders() {
        Long queryResults = orderRepository.getTotalOnlineOrders();
        return ResponseData.success("Lấy tổng số đơn hàng online", queryResults);
    }

    public ResponseData getTotalOfflineOrders() {
        Long queryResults = orderRepository.getTotalOfflineOrders();
        return ResponseData.success("Lấy tổng số đơn hàng offline", queryResults);
    }

    public ResponseData getTotalProducts() {
        Long queryResults = orderRepository.getTotalProducts();
        return ResponseData.success("Lấy tổng số sản phẩm", queryResults);
    }
}
