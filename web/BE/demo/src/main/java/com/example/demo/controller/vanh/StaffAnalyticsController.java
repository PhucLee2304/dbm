package com.example.demo.controller.vanh;

import com.example.demo.service.vanh.StaffAlertService;
import com.example.demo.service.vanh.StaffAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/staff")
public class StaffAnalyticsController {

    private final StaffAnalyticsService productivityService;
    private final StaffAlertService alertService;

    public StaffAnalyticsController(StaffAnalyticsService productivityService, StaffAlertService alertService) {
        this.productivityService = productivityService;
        this.alertService = alertService;
    }

    @GetMapping("/productivity")
    public ResponseEntity<?> getProductivity(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(productivityService.getStaffProductivity(month, year));
    }

    @GetMapping("/alerts")
    public ResponseEntity<?> getAlerts(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(alertService.getAlerts(month, year));
    }
}

