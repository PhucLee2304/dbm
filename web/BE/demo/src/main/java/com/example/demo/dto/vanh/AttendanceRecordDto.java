package com.example.demo.dto.vanh;

import com.example.demo.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AttendanceRecordDto {
    private LocalDate day;
    private LocalDateTime checkin;
    private LocalDateTime checkout;
    private AttendanceStatus checkInStatus;
    private AttendanceStatus checkOutStatus;
    private double totalHours;
}

