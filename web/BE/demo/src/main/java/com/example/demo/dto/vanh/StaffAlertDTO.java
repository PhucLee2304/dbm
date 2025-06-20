package com.example.demo.dto.vanh;

import java.util.ArrayList;
import java.util.List;

public class StaffAlertDTO {
    private Long staffId;
    private String staffCode;
    private List<String> alertTypes = new ArrayList<>();
    private List<String> messages = new ArrayList<>();

    public StaffAlertDTO(Long staffId, String staffCode) {
        this.staffId = staffId;
        this.staffCode = staffCode;
    }

    public void addAlert(String type, String message) {
        this.alertTypes.add(type);
        this.messages.add(message);
    }

    // Getters & Setters
    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public List<String> getAlertTypes() {
        return alertTypes;
    }

    public void setAlertTypes(List<String> alertTypes) {
        this.alertTypes = alertTypes;
    }

    public List<String> getMessages() {
        return messages;
    }

    public void setMessages(List<String> messages) {
        this.messages = messages;
    }
}
