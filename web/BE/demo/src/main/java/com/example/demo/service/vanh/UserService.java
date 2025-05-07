package com.example.demo.service.vanh;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.vanh.CustomerDTO;
import com.example.demo.dto.vanh.StaffDTO;
import com.example.demo.entity.*;
import com.example.demo.interfaces.vanh.UserInterface;
import com.example.demo.repository.*;
import com.example.demo.request.vanh.UpdateCustomerRequest;
import com.example.demo.request.vanh.UpdateStaffRequest;
import com.example.demo.request.vanh.UpdateSupplierRequest;
import com.example.demo.utils.ResponseData;
import com.example.demo.utils.UserUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserInterface {
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final UserUtil userUtil;
    //    private final PasswordEncoder passwordEncoder;
    private final BranchRepository branchRepository;
    private final SupplierRepository supplierRepository;

    @Override
    public ResponseData getAllCustomers() {
        try {
            List<Customer> customers = customerRepository.findAll();
            if (customers.isEmpty()) {
                return ResponseData.error("No customers found");
            }

            return ResponseData.success("Fetched all customers successfully", customers);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllStaff() {
        try {
            List<Staff> staffs = staffRepository.findAll();
            if (staffs.isEmpty()) {
                return ResponseData.error("No staffs found");
            }

            return ResponseData.success("Fetched all staffs successfully", staffs);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getAllSuppliers() {
        try {
            List<Supplier> suppliers = supplierRepository.findAll();
            if (suppliers.isEmpty()) {
                return ResponseData.error("No suppliers found");
            }

            return ResponseData.success("Fetched all suppliers successfully", suppliers);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData updateCustomer(UpdateCustomerRequest request) {
        try {
            ResponseData getUserInfoResponse = userUtil.getUserInfo();
            if (!getUserInfoResponse.isSuccess()) {
                return getUserInfoResponse;
            }
            User user = (User) getUserInfoResponse.getData();

            Optional<Customer> customerOptional = customerRepository.findByUserId(user.getId());
            if (customerOptional.isEmpty()) {
                return ResponseData.error("Customer not found");
            }
            Customer customer = customerOptional.get();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setPassword(request.getPassword());
            //            user.setPassword(passwordEncoder.encode(request.getPassword()));

            userRepository.save(user);

            customer.setUser(user);

            customerRepository.save(customer);

            return ResponseData.success("Update customer successfully", customerToCustomerDTO(customer));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData getCustomer() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        Optional<Customer> customerOpt = customerRepository.findByEmail(email);

        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            return ResponseData.success( "Lấy thông tin thành công", customerToCustomerDTO(customer));
        } else {
            return ResponseData.error("Không tìm thấy người dùng");
        }
    }

    private ResponseData customerToCustomerDTO(Customer customer) {
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setId(customer.getId());
        customerDTO.setEmail(customer.getUser().getEmail());
        customerDTO.setName(customer.getUser().getName());
        customerDTO.setPhone(customer.getUser().getPhone());
        customerDTO.setAddress(customer.getUser().getAddress());
        customerDTO.setRole(customer.getUser().getRole().toString());
        customerDTO.setActive(customer.getUser().isActive());

        return ResponseData.success("Convert customer successfully", customerDTO);
    }

    @Override
    public ResponseData updateStaff(UpdateStaffRequest request) {
        try {
            Optional<Staff> staffOptional = staffRepository.findById(request.getId());
            if (staffOptional.isEmpty()) {
                return ResponseData.error("Staff not found");
            }

            Optional<Branch> branchOptional = branchRepository.findById(request.getBranchId());
            if (branchOptional.isEmpty()) {
                return ResponseData.error("Branch not found");
            }

            Staff staff = staffOptional.get();
            staff.getUser().setName(request.getName());
            staff.getUser().setEmail(request.getEmail());
            staff.getUser().setPhone(request.getPhone());
            staff.getUser().setAddress(request.getAddress());
            staff.setBranch(branchOptional.get());
            staff.setExpiryDate(LocalDate.parse(request.getExpiryDate()));
            staff.setSalary(request.getSalary());

            staffRepository.save(staff);

            return ResponseData.success("Update staff successfully", staffToStaffDTO(staff));

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    private ResponseData staffToStaffDTO(Staff staff) {
        StaffDTO staffDTO = new StaffDTO();
        staffDTO.setId(staff.getId());
        staffDTO.setEmail(staff.getUser().getEmail());
        staffDTO.setName(staff.getUser().getName());
        staffDTO.setPhone(staff.getUser().getPhone());
        staffDTO.setAddress(staff.getUser().getAddress());
        staffDTO.setBranchName(staff.getBranch().getAddress());
        staffDTO.setCode(staff.getCode());
        staffDTO.setExpiryDate(staff.getExpiryDate());
        staffDTO.setSalary(staff.getSalary());
        staffDTO.setRole(staff.getUser().getRole().toString());
        staffDTO.setActive(staff.getUser().isActive());

        return ResponseData.success("Convert staff successfully", staffDTO);
    }

    @Override
    public ResponseData updateSupplier(UpdateSupplierRequest request) {
        try {
            Optional<Supplier> supplierOptional = supplierRepository.findById(request.getId());
            if (supplierOptional.isEmpty()) {
                return ResponseData.error("Supplier not found");
            }

            Supplier supplier = supplierOptional.get();
            supplier.setName(request.getName());
            supplier.setEmail(request.getEmail());
            supplier.setPhone(request.getPhone());
            supplier.setAddress(request.getAddress());

            supplierRepository.save(supplier);

            return ResponseData.success("Update supplier successfully", supplier);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData blockUser(Long id) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isEmpty()) {
                return ResponseData.error("User not found");
            }

            User user = userOptional.get();
            user.setActive(false);
            userRepository.save(user);

            return ResponseData.success("Blocked user successfully", user);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
