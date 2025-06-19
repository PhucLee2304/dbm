package com.example.demo.service.tien;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.KeyRecordDay;
import com.example.demo.entity.RecordDay;
import com.example.demo.entity.Staff;
import com.example.demo.entity.TimeSheet;
import com.example.demo.enums.AttendanceStatus;
import com.example.demo.interfaces.tien.AttendanceInterface;
import com.example.demo.repository.RecordDayRepository;
import com.example.demo.repository.StaffRepository;
import com.example.demo.repository.TimeSheetRepository;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService implements AttendanceInterface {

    private final TimeSheetRepository timeSheetRepository;
    private final RecordDayRepository recordDayRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public ResponseData checkIn(String staffEmail) {
        try {
            TimeSheet timeSheet = getOrCreateTimeSheet(staffEmail);
            LocalDate today = LocalDate.now();

            Optional<RecordDay> existingRecordOpt =
                    recordDayRepository.findByTimeSheetIdAndDay(timeSheet.getId(), today);

            if (existingRecordOpt.isPresent()) {
                return ResponseData.error("Bạn đã chấm công vào hôm nay");
            }

            LocalDateTime now = LocalDateTime.now();
            KeyRecordDay keyRecordDay = new KeyRecordDay(today, timeSheet.getId());

            RecordDay recordDay = new RecordDay();
            recordDay.setKeyRecordDay(keyRecordDay);
            recordDay.setTimeSheet(timeSheet);
            recordDay.setCheckin(now);
            if (now.getHour() < 7 || (now.getHour() == 7 && now.getMinute() == 0 && now.getSecond() == 0)) {
                recordDay.setCheckInStatus(AttendanceStatus.ONTIME);
            } else {
                recordDay.setCheckInStatus(AttendanceStatus.LATE);
            }

            recordDayRepository.save(recordDay);

            return ResponseData.success("Chấm công vào thành công", recordDay);
        } catch (Exception e) {
            return ResponseData.error("Chấm công vào thất bại: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ResponseData checkOut(String staffEmail) {
        try {
            TimeSheet timeSheet = getOrCreateTimeSheet(staffEmail);
            LocalDate today = LocalDate.now();

            Optional<RecordDay> existingRecordOpt =
                    recordDayRepository.findByTimeSheetIdAndDay(timeSheet.getId(), today);

            if (existingRecordOpt.isEmpty()) {
                return ResponseData.error("Không tìm thấy bản ghi chấm công vào hôm nay");
            }

            RecordDay recordDay = existingRecordOpt.get();

            if (recordDay.getCheckout() != null) {
                return ResponseData.error("Bạn đã chấm công ra hôm nay");
            }

            LocalDateTime now = LocalDateTime.now();
            recordDay.setCheckout(now);

            if (now.getHour() > 17 || (now.getHour() == 17 && now.getMinute() > 0)) {
                recordDay.setCheckOutStatus(AttendanceStatus.ONTIME);
            } else {
                //                 if (recordDay.getStatus() == AttendanceStatus.LATE)
                // recordDay.setStatus(AttendanceStatus.ONTIME);
                //                 else recordDay.setStatus(AttendanceStatus.ONTIME);
                recordDay.setCheckOutStatus(AttendanceStatus.EARLY);
            }
            recordDayRepository.save(recordDay);
            return ResponseData.success("Chấm công ra thành công", recordDay);
        } catch (Exception e) {
            return ResponseData.error("Chấm công ra thất bại: " + e.getMessage());
        }
    }

    private TimeSheet getOrCreateTimeSheet(String staffEmail) {
        Staff staff = staffRepository
                .findByUserEmail(staffEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với id: " + staffEmail));
        Optional<TimeSheet> timeSheetOpt = timeSheetRepository.findByStaffId(staff.getId());
        if (timeSheetOpt.isEmpty()) {
            TimeSheet newTimeSheet = new TimeSheet();
            newTimeSheet.setStaff(staff);
            return timeSheetRepository.save(newTimeSheet);
        }
        return timeSheetOpt.get();
    }
}
