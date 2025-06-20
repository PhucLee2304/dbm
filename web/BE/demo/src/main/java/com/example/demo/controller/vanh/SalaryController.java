package com.example.demo.controller.vanh;

import com.example.demo.dto.vanh.SalaryMonthlyDTO;
import com.example.demo.entity.SalaryMonthly;
import com.example.demo.service.vanh.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/salary")
public class SalaryController {

    @Autowired
    private SalaryService salaryService;

    @GetMapping("/calculate")
    public SalaryMonthlyDTO calculate(@RequestParam Long staffId,
                                      @RequestParam int month,
                                      @RequestParam int year) {
        return salaryService.calculateSalary(staffId, month, year);
    }

    @PostMapping("/pay")
    public SalaryMonthly pay(@RequestParam Long staffId,
                             @RequestParam int month,
                             @RequestParam int year) {
        return salaryService.paySalary(staffId, month, year);
    }
}

