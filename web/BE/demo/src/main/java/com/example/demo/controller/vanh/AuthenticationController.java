package com.example.demo.controller.vanh;

import com.example.demo.interfaces.vanh.AuthenticationInterface;
import com.example.demo.request.vanh.AddCustomerRequest;
import com.example.demo.request.vanh.AddStaffRequest;
import com.example.demo.request.vanh.AddSupplierRequest;
import com.example.demo.request.vanh.LoginRequest;
import com.example.demo.utils.ResponseData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationInterface authenticationInterface;

    @Autowired
    public AuthenticationController(AuthenticationInterface authenticationInterface) {
        this.authenticationInterface = authenticationInterface;
    }

    @PostMapping("/public/add/customer")
    public ResponseEntity<?> addCustomer(@RequestBody AddCustomerRequest request){
        ResponseData responseData = authenticationInterface.addCustomer(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/admin/add/staff")
    public ResponseEntity<?> addStaff(@RequestBody AddStaffRequest request){
        ResponseData responseData = authenticationInterface.addStaff(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/admin/add/supplier")
    public ResponseEntity<?> addSupplier(@RequestBody AddSupplierRequest request){
        ResponseData responseData = authenticationInterface.addSupplier(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PostMapping("/public/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        ResponseData responseData = authenticationInterface.login(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
