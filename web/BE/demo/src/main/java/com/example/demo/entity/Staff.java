package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "staff")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    Branch branch;

    @Column(nullable = false, unique = true)
    String code;

    //    @Column(nullable = false)
    //    @Min(1)
    //    int contractTerm;

    @Column(nullable = false)
    LocalDate expiryDate;

    @Column(nullable = false)
    @Min(0)
    double salary;
}
