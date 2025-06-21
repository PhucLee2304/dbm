package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.KeyRecordDay;
import com.example.demo.entity.RecordDay;

@Repository
public interface RecordDayRepository extends JpaRepository<RecordDay, KeyRecordDay> {
    // Use @Query annotation to specify the query explicitly
    @Query(
            "SELECT rd FROM RecordDay rd WHERE rd.keyRecordDay.time_sheet_id = :timeSheetId AND rd.keyRecordDay.day = :day")
    Optional<RecordDay> findByTimeSheetIdAndDay(@Param("timeSheetId") Long timeSheetId, @Param("day") LocalDate day);
    @Query("SELECT r FROM RecordDay r WHERE r.keyRecordDay.time_sheet_id = :timeSheetId")
    List<RecordDay> findAllByTimeSheetId(@Param("timeSheetId") Long timeSheetId);

    @Query("SELECT r FROM RecordDay r WHERE r.timeSheet.id IN :ids AND FUNCTION('MONTH', r.keyRecordDay.day) = :month AND FUNCTION('YEAR', r.keyRecordDay.day) = :year")
    List<RecordDay> findByTimeSheetIdsAndMonthAndYear(@Param("ids") List<Long> ids,
                                                      @Param("month") int month,
                                                      @Param("year") int year);

}
