package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "staff")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @OneToOne
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
