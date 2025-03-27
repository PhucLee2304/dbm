package com.example.demo.repository;

import com.example.demo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    //     List<Category> findAll();
    @Modifying
    @Transactional
    @Query(value = "UPDATE category SET name = :newName WHERE name = :name", nativeQuery = true)
    int updateCategoryName(@Param("newName") String newName, @Param("name") String name);
}
