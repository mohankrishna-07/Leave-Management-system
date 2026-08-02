package com.leavemanager.controller;

import com.leavemanager.dto.EmployeeDto;
import com.leavemanager.dto.LeaveRequestDto;
import com.leavemanager.service.EmployeeService;
import com.leavemanager.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;

    public AdminController(EmployeeService employeeService, LeaveService leaveService) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
    }

    // Dashboard Statistics
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = leaveService.getAdminDashboardStats();
        return ResponseEntity.ok(stats);
    }

    // Employee CRUD
    @GetMapping("/employees")
    public ResponseEntity<Page<EmployeeDto>> getEmployees(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<EmployeeDto> employees = employeeService.getAllEmployees(search, pageRequest);
        return ResponseEntity.ok(employees);
    }

    @PostMapping("/employees")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeDto employeeDto) {
        EmployeeDto createdEmployee = employeeService.createEmployee(employeeDto);
        return ResponseEntity.ok(createdEmployee);
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable String id, @Valid @RequestBody EmployeeDto employeeDto) {
        EmployeeDto updatedEmployee = employeeService.updateEmployee(id, employeeDto);
        return ResponseEntity.ok(updatedEmployee);
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    // Leave Management
    @GetMapping("/leaves")
    public ResponseEntity<Page<LeaveRequestDto>> getLeaves(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("appliedOn").descending());
        Page<LeaveRequestDto> leaves = leaveService.getAllLeaveRequests(search, pageRequest);
        return ResponseEntity.ok(leaves);
    }

    @PutMapping("/leaves/{id}/approve")
    public ResponseEntity<LeaveRequestDto> approveLeave(@PathVariable String id) {
        LeaveRequestDto approvedRequest = leaveService.approveLeave(id);
        return ResponseEntity.ok(approvedRequest);
    }

    @PutMapping("/leaves/{id}/reject")
    public ResponseEntity<LeaveRequestDto> rejectLeave(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.get("rejectionReason");
        LeaveRequestDto rejectedRequest = leaveService.rejectLeave(id, reason);
        return ResponseEntity.ok(rejectedRequest);
    }
}
