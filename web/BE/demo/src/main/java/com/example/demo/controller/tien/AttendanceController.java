package com.example.demo.controller.tien;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.interfaces.tien.AttendanceInterface;
import com.example.demo.utils.ResponseData;

@RestController
@RequestMapping("/attend")
public class AttendanceController {
    private final AttendanceInterface attendanceInterface;

    @Autowired
    public AttendanceController(AttendanceInterface attendanceInterface) {
        this.attendanceInterface = attendanceInterface;
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestParam String staffEmail) {
        ResponseData responseData = attendanceInterface.checkIn(staffEmail);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkOut(@RequestParam String staffEmail) {
        ResponseData responseData = attendanceInterface.checkOut(staffEmail);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
