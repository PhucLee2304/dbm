package com.example.demo.controller.tien;

import com.example.demo.repository.OrderRepository;
import com.example.demo.service.tien.DashboardService;
import com.example.demo.service.tien.ReportService;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/export-pdf/revenue")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdfBytes = reportService.generatePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bao_cao.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

}
