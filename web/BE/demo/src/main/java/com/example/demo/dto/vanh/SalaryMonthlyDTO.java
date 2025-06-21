package com.example.demo.dto.vanh;


public class SalaryMonthlyDTO {
    private Long staffId;
    private int month;
    private int year;
    private double totalHours;
    private double hourlySalary;
    private double totalSalary;
    private boolean paid;

    public SalaryMonthlyDTO() {
    }

    public SalaryMonthlyDTO(Long staffId, int month, int year, double totalHours,
                            double hourlySalary, double totalSalary, boolean paid) {
        this.staffId = staffId;
        this.month = month;
        this.year = year;
        this.totalHours = totalHours;
        this.hourlySalary = hourlySalary;
        this.totalSalary = totalSalary;
        this.paid = paid;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(double totalHours) {
        this.totalHours = totalHours;
    }

    public double getHourlySalary() {
        return hourlySalary;
    }

    public void setHourlySalary(double hourlySalary) {
        this.hourlySalary = hourlySalary;
    }

    public double getTotalSalary() {
        return totalSalary;
    }

    public void setTotalSalary(double totalSalary) {
        this.totalSalary = totalSalary;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }
}
