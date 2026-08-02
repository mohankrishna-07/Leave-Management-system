package com.leavemanager.controller;

import com.leavemanager.dto.EmployeeDto;
import com.leavemanager.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/profile")
    public ResponseEntity<EmployeeDto> getProfile(Principal principal) {
        EmployeeDto employeeDto = employeeService.getEmployeeByEmail(principal.getName());
        return ResponseEntity.ok(employeeDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeDto> updateProfile(Principal principal, @Valid @RequestBody EmployeeDto profileDto) {
        EmployeeDto currentEmployee = employeeService.getEmployeeByEmail(principal.getName());
        
        // Prevent employee from altering their own role or leave balance directly
        profileDto.setRole(currentEmployee.getRole());
        profileDto.setLeaveBalance(currentEmployee.getLeaveBalance());

        EmployeeDto updatedEmployee = employeeService.updateEmployee(currentEmployee.getId(), profileDto);
        return ResponseEntity.ok(updatedEmployee);
    }
}
