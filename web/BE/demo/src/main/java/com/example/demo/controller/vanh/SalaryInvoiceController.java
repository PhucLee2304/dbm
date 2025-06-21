package com.example.demo.controller.vanh;

import com.example.demo.dto.vanh.SalaryInvoiceDTO;
import com.example.demo.service.vanh.SalaryInvoiceService;
import com.example.demo.utils.PdfInvoiceExporter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/salary")
public class SalaryInvoiceController {

    @Autowired
    private SalaryInvoiceService salaryInvoiceService;

    @GetMapping("/invoice/pdf")
    public void exportInvoicePdf(
            @RequestParam Long staffId,
            @RequestParam int month,
            @RequestParam int year,
            HttpServletResponse response) {
        try {
            SalaryInvoiceDTO dto = salaryInvoiceService.getInvoice(staffId, month, year);

            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=salary-invoice-" + staffId + "-" + month + "-" + year + ".pdf");

            PdfInvoiceExporter.exportInvoice(response.getOutputStream(), dto);

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        }
    }
}

