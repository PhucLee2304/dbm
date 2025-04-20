package com.example.demo.utils;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@Service
@RequiredArgsConstructor
public class UserUtil {
    private final UserRepository userRepository;

    public ResponseData getUserInfo() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String email = auth.getName();
                Optional<User> userOptional = userRepository.findByEmail(email);
                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    return ResponseData.success("Fetched user info successfully", user);
                }

                return ResponseData.error("User not found");
            }

            return ResponseData.error("Authentication not found");

        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }
}
