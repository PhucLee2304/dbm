package com.example.demo.security;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.demo.entity.Branch;
import com.example.demo.entity.User;
import com.example.demo.enums.BranchEnum;
import com.example.demo.enums.RoleEnum;
import com.example.demo.repository.BranchRepository;
import com.example.demo.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    //    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    BranchRepository branchRepository;

    @Bean
    public ApplicationRunner init() {
        return args -> {
            if (userRepository.findByEmail("admin@gmail.com".toLowerCase()).isEmpty()) {
                User user = new User();
                user.setEmail("admin@gmail.com");
                user.setName("admin");
                user.setPhone("0123456789");
                user.setAddress("PTIT");
                user.setPassword("admin");
                user.setActive(true);
                user.setRole(RoleEnum.ADMIN);

                userRepository.save(user);
            }

            for (BranchEnum branchEnum : BranchEnum.values()) {
                if (branchRepository.findByAddress(branchEnum.name()).isEmpty()) {
                    Branch branch = new Branch();
                    branch.setAddress(branchEnum.name());
                    branchRepository.save(branch);
                }
            }
        };
    }
}
