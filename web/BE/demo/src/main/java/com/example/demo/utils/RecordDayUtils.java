package com.example.demo.utils;


import com.example.demo.entity.RecordDay;
import java.time.Duration;

public class RecordDayUtils {

    public static double calculateTotalHours(RecordDay recordDay) {
        if (recordDay.getCheckin() != null && recordDay.getCheckout() != null) {
            return Duration.between(recordDay.getCheckin(), recordDay.getCheckout()).toMinutes() / 60.0;
        }
        return 0;
    }
}
