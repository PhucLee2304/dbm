package com.example.demo.entity;

import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "time_sheet")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimeSheet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
    @JoinColumn(name = "staff_id")
    Staff staff;
}
