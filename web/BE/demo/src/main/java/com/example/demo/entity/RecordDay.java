package com.example.demo.entity;

import com.example.demo.enums.AttendanceStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "record_day")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RecordDay {
    @EmbeddedId
    KeyRecordDay keyRecordDay;

    @ManyToOne
    @JoinColumn(name = "time_sheet_id", insertable = false, updatable = false)
    @JsonBackReference
    TimeSheet timeSheet;

    @Column(nullable = false, updatable = false)
    LocalDateTime checkin;

    @Column(nullable = false, updatable = false)
    LocalDateTime checkout;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    AttendanceStatus status;
}
