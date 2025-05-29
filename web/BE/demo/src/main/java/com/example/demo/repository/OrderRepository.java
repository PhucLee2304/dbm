package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Order;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT SUM (o.total) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalRevenue();

    @Query(value = """
    SELECT TOP 5 
        p.id AS id,
        p.name AS name,
        SUM(od.quantity) AS totalQuantitySold,
        SUM(od.price * od.quantity) AS totalRevenue
    FROM product p
    INNER JOIN order_detail od ON p.id = od.product_id
    INNER JOIN order_table ot ON od.order_id = ot.id
    WHERE ot.status = 'completed'
    GROUP BY p.id, p.name
    ORDER BY SUM(od.quantity) DESC
    """, nativeQuery = true)
    List<Object[]> findTopProductRaw();

    @Query(value = """
    SELECT TOP 5
    s.id AS staff_id,
    s.code AS staff_code,
    u.name AS staff_name,
    COUNT(DISTINCT oo.order_id) AS total_orders,
    SUM(od.quantity) AS total_quantity_sold,
    SUM(od.price * od.quantity) AS total_revenue
    FROM staff s
    INNER JOIN user_table u ON s.user_id = u.id
    INNER JOIN order_offline oo ON s.id = oo.staff_id
    INNER JOIN order_detail od ON oo.order_id = od.order_id
    INNER JOIN order_table ot ON od.order_id = ot.id
    WHERE ot.status = 'completed'
    GROUP BY s.id, s.code, u.name
    ORDER BY SUM(od.quantity) DESC
    """, nativeQuery = true)
    List<Object[]> findTopStaffRaw();

    @Query(value = """
    SELECT TOP 5\s
        c.id AS customer_id,
        u.name AS customer_name,
        u.email,
        u.phone,
        COUNT(DISTINCT on2.order_id) AS total_orders,
        SUM(od.quantity) AS total_quantity_bought,
        SUM(od.price * od.quantity) AS total_spent
    FROM customer c
    INNER JOIN user_table u ON c.user_id = u.id
    INNER JOIN order_online on2 ON c.id = on2.customer_id
    INNER JOIN order_detail od ON on2.order_id = od.order_id
    INNER JOIN order_table ot ON od.order_id = ot.id
    WHERE ot.status = 'completed'
    GROUP BY c.id, u.name, u.email, u.phone
    ORDER BY SUM(od.quantity) DESC;
    """, nativeQuery = true)
    List<Object[]> findTopCustomerRaw();

    @Query(value = """
    SELECT\s
        YEAR(ot.created) AS year,
        MONTH(ot.created) AS month,
        DAY(ot.created) AS day,
        CONVERT(DATE, ot.created) AS order_date,
        COUNT(DISTINCT ot.id) AS total_orders,
        SUM(ot.total) AS daily_revenue
    FROM order_table ot
    WHERE ot.status = 'completed'
        AND ot.created >= DATEADD(MONTH, -1, GETDATE())
    GROUP BY YEAR(ot.created), MONTH(ot.created), DAY(ot.created), CONVERT(DATE, ot.created)
    ORDER BY order_date DESC;
    """, nativeQuery = true)
    List<Object[]> getEachDayRevenueLastMonthRaw();

    @Query(value = """
    SELECT COUNT(*) AS total_users
    FROM user_table;
    """, nativeQuery = true)
    Long getTotalUsers();

    @Query(value = """
    SELECT COUNT(*) AS total_customers
    FROM customer;
    """, nativeQuery = true)
    Long getTotalCustomers();

    @Query(value = """
    SELECT COUNT(*) AS total_staff
    FROM staff;
    """, nativeQuery = true)
    Long getTotalStaffs();

    @Query(value = """
    SELECT COUNT(*) AS total_orders
    FROM order_table;
    """, nativeQuery = true)
    Long getTotalOrders();

    @Query(value = """
    SELECT COUNT(*) AS total_online_orders
    FROM order_online;
    """, nativeQuery = true)
    Long getTotalOnlineOrders();

    @Query(value = """
    SELECT COUNT(*) AS total_offline_orders
    FROM order_offline;
    """, nativeQuery = true)
    Long getTotalOfflineOrders();

    @Query(value = """
    SELECT COUNT(*) AS total_products
    FROM product;
    """, nativeQuery = true)
    Long getTotalProducts();


}
