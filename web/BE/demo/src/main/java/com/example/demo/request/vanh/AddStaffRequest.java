package com.example.demo.request.vanh;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddStaffRequest {
    String name;
    String email;
    String phone;
    String address;
    String password;
    Long branchId;
    //    int contractTerm;
    String expiryDate;
    double salary;
}
