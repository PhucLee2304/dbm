package com.example.demo.dto.vanh;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffDTO {
    Long id;
    String name;
    String email;
    String phone;
    String address;
    String branchName;
    String code;
    //    int contractTerm;
    LocalDate expiryDate;
    double salary;
    boolean active;
    String role;
}
