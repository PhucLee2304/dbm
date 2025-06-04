package com.example.demo.service.vanh;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.dto.vanh.StaffDTO;
import com.example.demo.entity.*;
import com.example.demo.enums.RoleEnum;
import com.example.demo.interfaces.vanh.AuthenticationInterface;
import com.example.demo.repository.*;
import com.example.demo.request.vanh.AddCustomerRequest;
import com.example.demo.request.vanh.AddStaffRequest;
import com.example.demo.request.vanh.AddSupplierRequest;
import com.example.demo.request.vanh.LoginRequest;
import com.example.demo.service.tien.DashboardService;
import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.ResponseData;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements AuthenticationInterface {
    private final UserRepository userRepository;
    //    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    private final StaffRepository staffRepository;
    private final SupplierRepository supplierRepository;
    private final JwtUtil jwtUtil;
    private final DashboardService dashboardService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    private void updateUserDashboard() {
        ResponseData totalUsers = dashboardService.getTotalUsers();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-users", totalUsers);

        ResponseData totalCustomers = dashboardService.getTotalCustomers();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-customers", totalCustomers);

        ResponseData totalStaffs = dashboardService.getTotalStaffs();
        simpMessagingTemplate.convertAndSend("/topic/dashboard/total-staffs", totalStaffs);
    }

    @Override
    public ResponseData addCustomer(AddCustomerRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
                return ResponseData.error("Email đã tồn tại");
            }

            if (userRepository.existsByPhone(request.getPhone().toLowerCase())) {
                return ResponseData.error("Số điện thoại đã tồn tại");
            }

            User user = new User();
            user.setEmail(request.getEmail().toLowerCase());
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setPassword(request.getPassword());
            //            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setActive(true);
            user.setRole(RoleEnum.CUSTOMER);

            userRepository.save(user);

            Customer customer = new Customer();
            customer.setUser(user);

            customerRepository.save(customer);

            ResponseData generateTokenResponse = jwtUtil.generateToken(user);
            if (!generateTokenResponse.isSuccess()) {
                return generateTokenResponse;
            }
            String token = generateTokenResponse.getData().toString();

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("role", RoleEnum.CUSTOMER.toString());
            //            data.put("customer", customerToCustomerDTO(customer));

            ResponseData responseData = ResponseData.success("Đăng ký khách hàng mới thành công", token);

            if (responseData.isSuccess()) {
                updateUserDashboard();
            }

            return responseData;

            //            return ResponseData.success("Đăng ký khách hàng mới thành công", token);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData addStaff(AddStaffRequest request) {
        try {
            if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
                return ResponseData.error("Email đã tồn tại");
            }

            User user = new User();
            user.setEmail(request.getEmail().toLowerCase());
            user.setName(request.getName());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());
            user.setPassword(request.getPassword());
            //            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setActive(true);
            user.setRole(RoleEnum.STAFF);

            userRepository.save(user);

            Optional<Branch> branchOptional = branchRepository.findById(request.getBranchId());
            if (branchOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy chi nhánh");
            }
            Branch branch = branchOptional.get();

            Staff staff = new Staff();
            staff.setUser(user);
            staff.setBranch(branchOptional.get());
            staff.setExpiryDate(LocalDate.parse(request.getExpiryDate()));
            staff.setSalary(request.getSalary());
            staff.setCode("DBM" + branch.getAddress() + user.getId());

            staffRepository.save(staff);

            ResponseData responseData =
                    ResponseData.success("Đăng ký nhân viên mới thành công", staffToStaffDTO(staff));

            if (responseData.isSuccess()) {
                updateUserDashboard();
            }

            return responseData;

            //            return ResponseData.success("Đăng ký nhân viên mới thành công", staffToStaffDTO(staff));

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

        return ResponseData.success("Chuyển đổi thông tin nhân viên thành công", staffDTO);
    }

    @Override
    public ResponseData addSupplier(AddSupplierRequest request) {
        try {
            if (supplierRepository.existsByEmail(request.getEmail().toLowerCase())) {
                return ResponseData.error("Email đã tồn tại");
            }

            if (supplierRepository.existsByPhone(request.getPhone())) {
                return ResponseData.error("Số điện thoại đã tồn tại");
            }

            if (supplierRepository.existsByAddress(request.getAddress())) {
                return ResponseData.error("Địa chỉ đã tồn tại");
            }

            Supplier supplier = new Supplier();
            supplier.setEmail(request.getEmail().toLowerCase());
            supplier.setName(request.getName());
            supplier.setPhone(request.getPhone());
            supplier.setAddress(request.getAddress());

            supplierRepository.save(supplier);

            return ResponseData.success("Đăng ký nhà cung cấp mới thành công", supplier);

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    @Override
    public ResponseData login(LoginRequest request) {
        try {
            Optional<User> userOptional =
                    userRepository.findByEmail(request.getEmail().toLowerCase());
            if (userOptional.isEmpty()) {
                return ResponseData.error("Không tìm thấy email");
            }
            User user = userOptional.get();

            //            if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            //                return ResponseData.error("Mật khẩu không đúng");
            //            }

            if (!request.getPassword().equals(user.getPassword())) {
                return ResponseData.error("Mật khẩu không đúng");
            }

            if (!user.isActive()) {
                return ResponseData.error("Tài khoản không hoạt động");
            }

            ResponseData generateTokenResponse = jwtUtil.generateToken(user);
            if (!generateTokenResponse.isSuccess()) {
                return generateTokenResponse;
            }

            String token = generateTokenResponse.getData().toString();
            //            return ResponseData.success("Đăng nhập thành công", token);
            Map<String, Object> data = new HashMap<>();
            data.put("token", token);

            String role = user.getRole().toString();
            data.put("role", role);

            return ResponseData.success("Đăng nhập thành công", data);

            //            if(role.equals("ADMIN")){
            //                data.put("admin", user);
            //            } else if (role.equals("CUSTOMER")) {
            //                data.put("customer", user);
            //            } else{
            //                data.put("staff", user);
            //            }
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
