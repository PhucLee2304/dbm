package com.example.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.example.demo.enums.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "record_day")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecordDay {
    @EmbeddedId
    KeyRecordDay keyRecordDay;

    @ManyToOne
    @JoinColumn(name = "time_sheet_id", insertable = false, updatable = false)
    @JsonBackReference
    TimeSheet timeSheet;

    LocalDateTime checkin;

    LocalDateTime checkout;

    @Enumerated(EnumType.STRING)
    AttendanceStatus checkInStatus;

    @Enumerated(EnumType.STRING)
    AttendanceStatus checkOutStatus;

}
