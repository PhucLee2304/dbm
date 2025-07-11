package com.example.demo.request.vanh;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateCustomerRequest {
    String name;
    String email;
    String phone;
    String address;
    String oldPassword;
    String password;
}
