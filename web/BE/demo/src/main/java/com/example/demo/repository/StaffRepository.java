package com.example.demo.repository;

import com.example.demo.entity.Staff;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    @Query("SELECT s FROM Staff s WHERE s.user.id = :userId")
    Optional<Staff> findByUserId(@Param("userId") Long userId);

    boolean existsByCode(String code);

    Optional<Staff> findByUser(com.example.demo.entity.User user);
}
