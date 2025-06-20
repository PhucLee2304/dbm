package com.example.demo.dto.vanh;

public class StaffProductivityDTO {
    private Long staffId;
    private String staffCode;
    private int workingDays;
    private double totalHours;
    private double productivity; // giờ/ngày

    // Constructors
    public StaffProductivityDTO(Long staffId, String staffCode, int workingDays, double totalHours, double productivity) {
        this.staffId = staffId;
        this.staffCode = staffCode;
        this.workingDays = workingDays;
        this.totalHours = totalHours;
        this.productivity = productivity;
    }

    // Getters
    public Long getStaffId() {
        return staffId;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public int getWorkingDays() {
        return workingDays;
    }

    public double getTotalHours() {
        return totalHours;
    }

    public double getProductivity() {
        return productivity;
    }

    // Setters
    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public void setWorkingDays(int workingDays) {
        this.workingDays = workingDays;
    }

    public void setTotalHours(double totalHours) {
        this.totalHours = totalHours;
    }

    public void setProductivity(double productivity) {
        this.productivity = productivity;
    }
}
