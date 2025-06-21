package com.example.demo.service.vanh;

import com.example.demo.dto.vanh.StaffProductivityDTO;
import com.example.demo.repository.StaffAnalyticsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StaffAnalyticsService {

    private final StaffAnalyticsRepository repository;

    public StaffAnalyticsService(StaffAnalyticsRepository repository) {
        this.repository = repository;
    }

    public List<StaffProductivityDTO> getStaffProductivity(int month, int year) {
        List<Object[]> rows = repository.getProductivityNative(month, year);
        List<StaffProductivityDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            Long staffId = ((Number) row[0]).longValue();
            String code = (String) row[1];
            int workingDays = ((Number) row[2]).intValue();
            double totalHours = ((Number) row[3]).doubleValue();
            double productivity = ((Number) row[4]).doubleValue();

            result.add(new StaffProductivityDTO(staffId, code, workingDays, totalHours, productivity));
        }

        return result;
    }
}


