package com.example.demo.dto.tien;

import lombok.Data;

@Data
public class AttendanceRequestDto {
    private Long staffId;
    private String ipAddress;
    private String location;
}
