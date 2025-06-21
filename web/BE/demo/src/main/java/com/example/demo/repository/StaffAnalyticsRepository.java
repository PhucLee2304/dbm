package com.example.demo.repository;

import com.example.demo.dto.vanh.StaffProductivityDTO;
import com.example.demo.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffAnalyticsRepository extends JpaRepository<Staff, Long> {

    @Query(value = """
        SELECT 
            s.id AS staff_id,
            s.code AS staff_code,
            COUNT(rd.day) AS working_days,
            SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 AS total_hours,
            ROUND(SUM(DATEDIFF(MINUTE, rd.checkin, rd.checkout)) / 60.0 / COUNT(rd.day), 2) AS productivity
        FROM staff s
        JOIN time_sheet ts ON s.id = ts.staff_id
        JOIN record_day rd ON ts.id = rd.time_sheet_id
        WHERE MONTH(rd.day) = :month AND YEAR(rd.day) = :year
            AND rd.checkin IS NOT NULL AND rd.checkout IS NOT NULL
        GROUP BY s.id, s.code
        ORDER BY productivity DESC
    """, nativeQuery = true)
    List<Object[]> getProductivityNative(@Param("month") int month, @Param("year") int year);
}
