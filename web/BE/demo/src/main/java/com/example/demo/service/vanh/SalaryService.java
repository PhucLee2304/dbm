package com.example.demo.service.vanh;

import com.example.demo.dto.vanh.SalaryMonthlyDTO;
import com.example.demo.entity.RecordDay;
import com.example.demo.entity.SalaryMonthly;
import com.example.demo.entity.Staff;
import com.example.demo.entity.TimeSheet;
import com.example.demo.repository.RecordDayRepository;
import com.example.demo.repository.SalaryMonthlyRepository;
import com.example.demo.repository.StaffRepository;
import com.example.demo.repository.TimeSheetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalaryService {
    @Autowired private RecordDayRepository recordDayRepository;
    @Autowired private TimeSheetRepository timeSheetRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private SalaryMonthlyRepository salaryMonthlyRepository;

    public SalaryMonthlyDTO calculateSalary(Long staffId, int month, int year) {
        Staff staff = staffRepository.findById(staffId).orElseThrow();
        double salaryPerHour = staff.getSalary();

        List<Long> timeSheetIds = timeSheetRepository.findByStaffId(staffId)
                .stream().map(TimeSheet::getId).toList();

        List<RecordDay> records = recordDayRepository
                .findByTimeSheetIdsAndMonthAndYear(timeSheetIds, month, year);

        double totalHours = records.stream()
                .mapToDouble(RecordDay::getTotalHours).sum();

        double totalSalary = totalHours * salaryPerHour;

        boolean paid = salaryMonthlyRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year)
                .map(SalaryMonthly::getPaid)
                .orElse(false);


        return new SalaryMonthlyDTO(staffId, month, year, totalHours, salaryPerHour, totalSalary, paid);
    }


    public SalaryMonthly paySalary(Long staffId, int month, int year) {
        Optional<SalaryMonthly> existing = salaryMonthlyRepository
                .findByStaffIdAndMonthAndYear(staffId, month, year);

        if (existing.isPresent()) {
            SalaryMonthly existingSalary = existing.get();
            if (!Boolean.TRUE.equals(existingSalary.getPaid())) {
                existingSalary.setPaid(true);
                return salaryMonthlyRepository.save(existingSalary);
            }
            return existingSalary; // nếu đã paid = true rồi
        }


        SalaryMonthlyDTO dto = calculateSalary(staffId, month, year);

        SalaryMonthly salary = new SalaryMonthly();
        salary.setStaffId(staffId);
        salary.setMonth(month);
        salary.setYear(year);
        salary.setTotalHours(dto.getTotalHours());
        salary.setHourlySalary(dto.getHourlySalary());
        salary.setTotalSalary(dto.getTotalSalary());
        salary.setPaid(true);

        return salaryMonthlyRepository.save(salary);
    }
}
