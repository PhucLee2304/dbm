package com.example.demo.repository;

import com.example.demo.entity.SalaryMonthly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryMonthlyRepository extends JpaRepository<SalaryMonthly, Long> {
    Optional<SalaryMonthly> findByStaffIdAndMonthAndYear(Long staffId, int month, int year);
}
