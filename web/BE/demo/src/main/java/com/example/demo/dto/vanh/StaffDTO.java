package com.example.demo.dto.vanh;

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
    String expiryDate;
    double salary;
    boolean active;
}
