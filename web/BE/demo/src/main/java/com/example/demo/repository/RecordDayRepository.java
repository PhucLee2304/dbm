package com.example.demo.repository;

import com.example.demo.entity.KeyRecordDay;
import com.example.demo.entity.RecordDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

import com.example.demo.dto.tien.ProductDetailDTO;
import com.example.demo.entity.Product;

@Repository
public interface RecordDayRepository extends JpaRepository<RecordDay, KeyRecordDay> {
    // Use @Query annotation to specify the query explicitly
    @Query("SELECT rd FROM RecordDay rd WHERE rd.keyRecordDay.time_sheet_id = :timeSheetId AND rd.keyRecordDay.day = :day")
    Optional<RecordDay> findByTimeSheetIdAndDay(@Param("timeSheetId") Long timeSheetId, @Param("day") LocalDate day);
}
