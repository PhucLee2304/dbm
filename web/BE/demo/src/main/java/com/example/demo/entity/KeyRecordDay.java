package com.example.demo.entity;

import java.time.LocalDate;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Embeddable
@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeyRecordDay {
    @Column(nullable = false)
    LocalDate day;

    @Column(nullable = false)
    Long time_sheet_id;

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        KeyRecordDay that = (KeyRecordDay) obj;
        return day == that.day && time_sheet_id == that.time_sheet_id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(day, time_sheet_id);
    }
}
