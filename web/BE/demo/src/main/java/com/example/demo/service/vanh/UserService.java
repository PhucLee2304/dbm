package com.example.demo.service.vanh;

import com.example.demo.entity.*;
import com.example.demo.interfaces.vanh.UserInterface;
import com.example.demo.repository.*;
import com.example.demo.request.vanh.UpdateCustomerRequest;
import com.example.demo.request.vanh.UpdateStaffRequest;
import com.example.demo.request.vanh.UpdateSupplierRequest;
import com.example.demo.utils.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserInterface {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final BranchRepository branchRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    private final SupplierRepository supplierRepository;


    @Override
    public ResponseData getAllCustomers() {
        try {
            List<Customer> customers = customerRepository.findAll();
            return ResponseData.success("Fetched all customers successfully", customers);
        } catch (Exception e) {
            return ResponseData.error("Error fetching customers: " + e.getMessage());
        }
    }

    @Override
    public ResponseData getAllStaff() {
        try {
            List<Staff> staffs = staffRepository.findAll();
            return ResponseData.success("Fetched all staffs successfully", staffs);
        } catch (Exception e) {
            return ResponseData.error("Error fetching customers: " + e.getMessage());
        }
    }

    @Override
    public ResponseData updateCustomer(UpdateCustomerRequest request) {
        try {
            Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
            if (optionalUser.isEmpty()) {
                return ResponseData.error("Customer not found");
            }

            User user = optionalUser.get();
            Optional<Customer> optionalCustomer = customerRepository.findByUser(user);
            if (optionalCustomer.isEmpty()) {
                return ResponseData.error("Customer record not found");
            }

            // Update user details
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());

            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            userRepository.save(user);

            return ResponseData.success("Customer updated successfully", user);
        } catch (Exception e) {
            return ResponseData.error("Error updating customer: " + e.getMessage());
        }
    }

    @Override
    public ResponseData updateStaff(UpdateStaffRequest request) {
        try {
            // 1. Tìm User dựa vào email
            Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
            if (optionalUser.isEmpty()) {
                return ResponseData.error("Staff not found");
            }

            User user = optionalUser.get();

            // 2. Tìm Staff dựa vào User
            Optional<Staff> optionalStaff = staffRepository.findByUser(user);
            if (optionalStaff.isEmpty()) {
                return ResponseData.error("Staff record not found");
            }

            Staff staff = optionalStaff.get();

            // 3. Cập nhật thông tin User
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());

            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // 4. Cập nhật thông tin Staff
            if (request.getBranchId() != null) {
                Optional<Branch> optionalBranch = branchRepository.findById(request.getBranchId());
                if (optionalBranch.isEmpty()) {
                    return ResponseData.error("Branch not found");
                }
                staff.setBranch(optionalBranch.get());
            }

            if (request.getExpiryDate() != null) {
                staff.setExpiryDate(LocalDate.parse(request.getExpiryDate()));
            }

            staff.setSalary(request.getSalary());

            // 5. Lưu dữ liệu
            userRepository.save(user);
            staffRepository.save(staff);

            return ResponseData.success("Staff updated successfully", staff);
        } catch (Exception e) {
            return ResponseData.error("Error updating staff: " + e.getMessage());
        }


    }

    @Override
    public ResponseData updateSupplier(UpdateSupplierRequest request) {
        try {

            Optional<Supplier> optionalSupplier = supplierRepository.findByEmail(request.getEmail());
            if (optionalSupplier.isEmpty()) {
                return ResponseData.error("Supplier not found");
            }

            Supplier supplier = optionalSupplier.get();

            // Kiểm tra dữ liệu trùng lặp trước khi cập nhật
            if (!supplier.getPhone().equals(request.getPhone()) && supplierRepository.existsByPhone(request.getPhone())) {
                return ResponseData.error("Phone number already exists");
            }
            if (!supplier.getAddress().equals(request.getAddress()) && supplierRepository.existsByAddress(request.getAddress())) {
                return ResponseData.error("Address already exists");
            }

            // Cập nhật thông tin
            supplier.setName(request.getName());
            supplier.setPhone(request.getPhone());
            supplier.setAddress(request.getAddress());

            // Lưu cập nhật
            supplierRepository.save(supplier);

            return ResponseData.success("Supplier updated successfully", supplier);
        } catch (Exception e) {
            return ResponseData.error("Error updating supplier: " + e.getMessage());
        }
    }

    @Override
    public ResponseData blockUser(Long userId) {
        try {
            Optional<User> optionalUser = userRepository.findById(userId);
            if (optionalUser.isEmpty()) {
                return ResponseData.error("User not found");
            }

            User user = optionalUser.get();
            user.setBlocked(true);  // Cập nhật trạng thái
            userRepository.save(user);

            return ResponseData.success("User blocked successfully", user);
        } catch (Exception e) {
            return ResponseData.error("Error blocking user: " + e.getMessage());
        }
    }

}


