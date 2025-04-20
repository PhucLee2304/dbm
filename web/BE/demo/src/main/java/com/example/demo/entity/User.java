package com.example.demo.entity;

import jakarta.persistence.*;

import com.example.demo.enums.RoleEnum;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "user_table")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = false, unique = true)
    String phone;

    @Column(nullable = false)
    String address;

    @Column(nullable = false)
    String password;

    @Column(nullable = false)
    boolean active;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    RoleEnum role;
}
