package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.TimeSheet;

@Repository
public interface TimeSheetRepository extends JpaRepository<TimeSheet, Long> {
    Optional<TimeSheet> findByStaffId(Long staffId);

}
