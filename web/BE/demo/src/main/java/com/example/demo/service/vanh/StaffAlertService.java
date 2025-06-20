package com.example.demo.service.vanh;

import com.example.demo.dto.vanh.StaffAlertDTO;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StaffAlertService {

    private final EntityManager em;

    public StaffAlertService(EntityManager em) {
        this.em = em;
    }

    public List<StaffAlertDTO> getAlerts(int month, int year) {
        Map<Long, StaffAlertDTO> alertMap = new HashMap<>();

        recordAlert("""
            SELECT s.id, s.code, COUNT(*) total,
                   SUM(CASE WHEN rd.check_in_status = 'LATE' THEN 1 ELSE 0 END) lateCount
            FROM staff s
            JOIN time_sheet ts ON s.id = ts.staff_id
            JOIN record_day rd ON ts.id = rd.time_sheet_id
            WHERE MONTH(rd.day) = :month AND YEAR(rd.day) = :year
            GROUP BY s.id, s.code
            HAVING SUM(CASE WHEN rd.check_in_status = 'LATE' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) > 30
        """, month, year, "LATE", "Tỷ lệ đi muộn vượt quá 30%", alertMap);

        recordAlert("""
            SELECT s.id, s.code, COUNT(DISTINCT rd.day) AS workDays
            FROM staff s
            JOIN time_sheet ts ON s.id = ts.staff_id
            JOIN record_day rd ON ts.id = rd.time_sheet_id
            WHERE MONTH(rd.day) = :month AND YEAR(rd.day) = :year
            GROUP BY s.id, s.code
            HAVING COUNT(DISTINCT rd.day) < 10
        """, month, year, "LOW_ATTENDANCE", "Số ngày làm việc trong tháng dưới 10", alertMap);

        recordAlert("""
            SELECT DISTINCT s.id, s.code
            FROM staff s
            JOIN time_sheet ts ON s.id = ts.staff_id
            JOIN record_day rd ON ts.id = rd.time_sheet_id
            WHERE MONTH(rd.day) = :month AND YEAR(rd.day) = :year
              AND DATEDIFF(HOUR, rd.checkin, rd.checkout) > 12
        """, month, year, "OVERWORK", "Ngày làm việc vượt quá 12 tiếng", alertMap);

        recordAlert("""
            SELECT s.id, s.code, COUNT(*) total,
                   SUM(CASE WHEN rd.check_out_status = 'EARLY' THEN 1 ELSE 0 END) earlyCount
            FROM staff s
            JOIN time_sheet ts ON s.id = ts.staff_id
            JOIN record_day rd ON ts.id = rd.time_sheet_id
            WHERE MONTH(rd.day) = :month AND YEAR(rd.day) = :year
            GROUP BY s.id, s.code
            HAVING SUM(CASE WHEN rd.check_out_status = 'EARLY' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) > 30
        """, month, year, "EARLY_LEAVE", "Tỷ lệ về sớm vượt quá 30%", alertMap);

        return new ArrayList<>(alertMap.values());
    }

    private void recordAlert(String sql, int month, int year, String alertType, String message,
                             Map<Long, StaffAlertDTO> alertMap) {
        List<Object[]> rows = em.createNativeQuery(sql)
                .setParameter("month", month)
                .setParameter("year", year)
                .getResultList();

        for (Object[] row : rows) {
            Long staffId = ((Number) row[0]).longValue();
            String staffCode = (String) row[1];

            StaffAlertDTO dto = alertMap.getOrDefault(staffId, new StaffAlertDTO(staffId, staffCode));
            dto.addAlert(alertType, message);
            alertMap.put(staffId, dto);
        }
    }
}
