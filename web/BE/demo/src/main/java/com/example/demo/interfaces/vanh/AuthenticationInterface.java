package com.example.demo.interfaces.vanh;

import com.example.demo.request.vanh.AddCustomerRequest;
import com.example.demo.request.vanh.AddStaffRequest;
import com.example.demo.request.vanh.AddSupplierRequest;
import com.example.demo.request.vanh.LoginRequest;
import com.example.demo.utils.ResponseData;

public interface AuthenticationInterface {
    ResponseData addCustomer(AddCustomerRequest request);

    ResponseData addStaff(AddStaffRequest request);

    ResponseData addSupplier(AddSupplierRequest request);

    ResponseData login(LoginRequest request);
}
