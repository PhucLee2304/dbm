package com.example.demo.service.vanh;

import com.example.demo.entity.User;
import com.example.demo.interfaces.vanh.UserInterface;
import com.example.demo.repository.UserRepository;
import com.example.demo.request.vanh.UpdateCustomerRequest;
import com.example.demo.request.vanh.UpdateStaffRequest;
import com.example.demo.request.vanh.UpdateSupplierRequest;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserInterface {
    private final UserRepository userRepository;

    @Override
    public ResponseData getAllCustomers() {
        return null;
    }

    @Override
    public ResponseData getAllStaff() {
        return null;
    }

    @Override
    public ResponseData updateCustomer(UpdateCustomerRequest request) {
        return null;
    }

    @Override
    public ResponseData updateStaff(UpdateStaffRequest request) {
        return null;
    }

    @Override
    public ResponseData updateSupplier(UpdateSupplierRequest request) {
        return null;
    }

    @Override
    public ResponseData blockUser() {
        return null;
    }
}
