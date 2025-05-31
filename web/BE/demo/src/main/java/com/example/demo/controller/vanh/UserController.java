package com.example.demo.controller.vanh;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.interfaces.vanh.UserInterface;
import com.example.demo.request.vanh.UpdateCustomerRequest;
import com.example.demo.request.vanh.UpdateStaffRequest;
import com.example.demo.request.vanh.UpdateSupplierRequest;
import com.example.demo.utils.ResponseData;

@RestController
@RequestMapping("/user")
public class UserController {
    private final UserInterface userInterface;

    @Autowired
    public UserController(UserInterface userInterface) {
        this.userInterface = userInterface;
    }

    @GetMapping("/admin/customer/all")
    public ResponseEntity<?> getAllCustomers() {
        ResponseData responseData = userInterface.getAllCustomers();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/admin/staff/all")
    public ResponseEntity<?> getAllStaff() {
        ResponseData responseData = userInterface.getAllStaff();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/admin/supplier/all")
    public ResponseEntity<?> getAllSuppliers() {
        ResponseData responseData = userInterface.getAllSuppliers();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/customer/update")
    public ResponseEntity<?> updateCustomer(@RequestBody UpdateCustomerRequest request) {
        ResponseData responseData = userInterface.updateCustomer(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @GetMapping("/customer/info")
    public ResponseEntity<?> getCustomer() {
        ResponseData responseData = userInterface.getCustomer();
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/admin/staff/update")
    public ResponseEntity<?> updateStaff(@RequestBody UpdateStaffRequest request) {
        ResponseData responseData = userInterface.updateStaff(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @PutMapping("/admin/supplier/update")
    public ResponseEntity<?> updateSupplier(@RequestBody UpdateSupplierRequest request) {
        ResponseData responseData = userInterface.updateSupplier(request);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    @DeleteMapping("/admin/block/{id}")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        ResponseData responseData = userInterface.blockUser(id);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
