package com.leavemanager.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "leave_request")
public class LeaveRequest {

    @Id
    private String id;

    @DocumentReference
    @NotNull
    private Employee employee;

    @NotNull

    private LocalDate startDate;

    @NotNull

    private LocalDate endDate;

    @NotBlank

    private String leaveType; // 'Sick Leave', 'Casual Leave', etc.

    @NotBlank

    private String reason;

    @NotBlank

    private String status = "PENDING"; // 'PENDING', 'APPROVED', 'REJECTED'


    private String rejectionReason;

    @NotNull

    private LocalDateTime appliedOn = LocalDateTime.now();

    // Constructors
    public LeaveRequest() {
    }

    public LeaveRequest(Employee employee, LocalDate startDate, LocalDate endDate, String leaveType, String reason) {
        this.employee = employee;
        this.startDate = startDate;
        this.endDate = endDate;
        this.leaveType = leaveType;
        this.reason = reason;
        this.status = "PENDING";
        this.appliedOn = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getAppliedOn() {
        return appliedOn;
    }

    public void setAppliedOn(LocalDateTime appliedOn) {
        this.appliedOn = appliedOn;
    }
}
