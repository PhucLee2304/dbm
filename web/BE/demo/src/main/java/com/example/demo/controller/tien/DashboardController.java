package com.example.demo.controller.tien;

import com.example.demo.dto.tien.TopProductDTO;
import com.example.demo.repository.OrderRepository;
import com.example.demo.service.tien.DashboardService;
import com.example.demo.service.tien.ReportService;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseData getTotalRevenue() {
        return dashboardService.getTotalRevenue();
    }

    @GetMapping("/export-pdf")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdfBytes = reportService.generatePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao_cao.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

//    1
    @GetMapping("/top-product")
    public ResponseEntity<?> getTopProducts() {
        ResponseData responseData = dashboardService.getTopProducts();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    2
    @GetMapping("/top-staff")
    public ResponseEntity<?> getTopStaff() {
        ResponseData responseData = dashboardService.getTopStaff();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    3
    @GetMapping("/top-customer")
    public ResponseEntity<?> getTopCustomer() {
        ResponseData responseData = dashboardService.getTopCustomer();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    4
    @GetMapping("/daily-revenue-last-month")
    public ResponseEntity<?> getEachDayRevenueLastMonth() {
        ResponseData responseData = dashboardService.getEachDayRevenueLastMonth();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    5
    @GetMapping("/total-users")
    public ResponseEntity<?> getTotalUsers() {
        ResponseData responseData = dashboardService.getTotalUsers();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    6
    @GetMapping("/total-customers")
    public ResponseEntity<?> getTotalCustomers() {
        ResponseData responseData = dashboardService.getTotalCustomers();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    7
    @GetMapping("/total-staffs")
    public ResponseEntity<?> getTotalStaffs() {
        ResponseData responseData = dashboardService.getTotalStaffs();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    8
    @GetMapping("/total-orders")
    public ResponseEntity<?> getTotalOrders() {
        ResponseData responseData = dashboardService.getTotalOrders();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    9
    @GetMapping("/total-online-orders")
    public ResponseEntity<?> getTotalOnlineOrders() {
        ResponseData responseData = dashboardService.getTotalOnlineOrders();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    10
    @GetMapping("/total-offline-orders")
    public ResponseEntity<?> getTotalOfflineOrders() {
        ResponseData responseData = dashboardService.getTotalOfflineOrders();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

//    11
    @GetMapping("/total-products")
    public ResponseEntity<?> getTotalProducts() {
        ResponseData responseData = dashboardService.getTotalProducts();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
