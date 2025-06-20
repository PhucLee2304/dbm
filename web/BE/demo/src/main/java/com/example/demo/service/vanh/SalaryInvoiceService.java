package com.example.demo.service.vanh;

import com.example.demo.dto.vanh.SalaryInvoiceDTO;
import com.example.demo.entity.SalaryMonthly;
import com.example.demo.entity.Staff;
import com.example.demo.repository.SalaryMonthlyRepository;
import com.example.demo.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SalaryInvoiceService {

    @Autowired
    private SalaryMonthlyRepository salaryMonthlyRepository;

    @Autowired
    private StaffRepository staffRepository;

    public SalaryInvoiceDTO getInvoice(Long staffId, int month, int year) {
        SalaryMonthly salary = salaryMonthlyRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        SalaryInvoiceDTO dto = new SalaryInvoiceDTO();
        dto.setStaffId(staff.getId());
        dto.setStaffName(staff.getUser().getName()); // ✅ Sửa tại đây
        dto.setMonth(salary.getMonth());
        dto.setYear(salary.getYear());
        dto.setTotalHours(salary.getTotalHours());
        dto.setHourlySalary(salary.getHourlySalary());
        dto.setTotalSalary(salary.getTotalSalary());
        dto.setPaid(salary.getPaid());
        dto.setCreatedAt(salary.getCreatedAt());

        return dto;
    }
}

