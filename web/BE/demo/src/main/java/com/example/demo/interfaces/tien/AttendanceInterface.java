package com.example.demo.interfaces.tien;

import com.example.demo.utils.ResponseData;

public interface AttendanceInterface {
    ResponseData checkIn(String staffEmail);
    ResponseData checkOut(String staffEmail);
}
