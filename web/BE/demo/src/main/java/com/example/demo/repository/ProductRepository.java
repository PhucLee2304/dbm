package com.example.demo.repository;

import com.example.demo.dto.hoang.ProductDTO;
import com.example.demo.dto.tien.HomeProductDTO;
import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.ArrayList;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = """
        WITH NumberedProducts AS (
            SELECT p.category_id, p.supplier_id, p.name, p.price,\s
                   ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS row_num
            FROM product p
            JOIN branch_product bp ON p.id = bp.product_id
            JOIN branch b ON bp.branch_id = b.id
            WHERE b.address = 'ONLINE'
        )
        SELECT category_id, supplier_id, name, price
        FROM NumberedProducts
        WHERE row_num IN (
            SELECT TOP (:quantity) row_num FROM NumberedProducts ORDER BY NEWID()
        );
    """, nativeQuery = true)
    ArrayList<HomeProductDTO> getRandomProductByBranchAddress(@Param("quantity") int quantity);
}
