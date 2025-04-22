package com.example.demo.controller.tien;

import com.example.demo.dto.tien.AttendanceRequestDto;
import com.example.demo.interfaces.tien.AttendanceInterface;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attend")
public class AttendanceController {
    private final AttendanceInterface attendanceInterface;

    @Autowired
    public AttendanceController(AttendanceInterface attendanceInterface) {
        this.attendanceInterface = attendanceInterface;
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestParam Long staffId) {
        ResponseData responseData = attendanceInterface.checkIn(staffId);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkOut(@RequestParam Long staffId) {
        ResponseData responseData = attendanceInterface.checkOut(staffId);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
