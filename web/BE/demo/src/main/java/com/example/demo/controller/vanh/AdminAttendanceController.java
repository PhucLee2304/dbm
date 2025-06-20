package com.example.demo.controller.vanh;

import com.example.demo.dto.vanh.AttendanceRecordDto;
import com.example.demo.entity.RecordDay;
import com.example.demo.entity.TimeSheet;
import com.example.demo.repository.RecordDayRepository;
import com.example.demo.repository.TimeSheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final RecordDayRepository recordDayRepository;
    private final TimeSheetRepository timeSheetRepository;

    @GetMapping("/{staffId}")
    public ResponseEntity<?> getAttendanceRecords(
            @PathVariable Long staffId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {

        Optional<TimeSheet> timeSheetOpt = timeSheetRepository.findByStaffId(staffId);
        if (timeSheetOpt.isEmpty()) return ResponseEntity.badRequest().body("No timesheet found");

        Long timeSheetId = timeSheetOpt.get().getId();

        List<RecordDay> records = recordDayRepository.findAllByTimeSheetId(timeSheetId);
        if (month != null && year != null) {
            records = records.stream()
                    .filter(r -> r.getKeyRecordDay().getDay().getMonthValue() == month &&
                            r.getKeyRecordDay().getDay().getYear() == year)
                    .collect(Collectors.toList());
        }

        List<AttendanceRecordDto> result = records.stream().map(r -> {
            double totalHours = 0;
            if (r.getCheckin() != null && r.getCheckout() != null) {
                totalHours = Duration.between(r.getCheckin(), r.getCheckout()).toMinutes() / 60.0;
            }
            return new AttendanceRecordDto(
                    r.getKeyRecordDay().getDay(),
                    r.getCheckin(),
                    r.getCheckout(),
                    r.getCheckInStatus(),
                    r.getCheckOutStatus(),
                    totalHours
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}

