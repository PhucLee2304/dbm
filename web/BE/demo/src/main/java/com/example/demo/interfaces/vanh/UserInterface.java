package com.example.demo.interfaces.vanh;

import com.example.demo.request.vanh.UpdateCustomerRequest;
import com.example.demo.request.vanh.UpdateStaffRequest;
import com.example.demo.request.vanh.UpdateSupplierRequest;
import com.example.demo.utils.ResponseData;

public interface UserInterface {
    ResponseData getAllCustomers();

    ResponseData getAllStaff();

    ResponseData getAllSuppliers();

    ResponseData updateCustomer(UpdateCustomerRequest request);

    ResponseData getCustomer();

    ResponseData updateStaff(UpdateStaffRequest request);

    ResponseData updateSupplier(UpdateSupplierRequest request);

    ResponseData blockUser(Long userId);
}
