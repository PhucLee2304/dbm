package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Staff;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    @Query("SELECT s FROM Staff s WHERE s.user.id = :userId")
    Optional<Staff> findByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Staff s WHERE s.user.email = :email")
    Optional<Staff> findByUserEmail(@Param("email") String email);

    boolean existsByCode(String code);

    Optional<Staff> findByUser(com.example.demo.entity.User user);
}
