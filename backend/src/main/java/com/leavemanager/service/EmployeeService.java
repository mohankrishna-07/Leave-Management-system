package com.leavemanager.service;

import com.leavemanager.dto.EmployeeDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeDto createEmployee(EmployeeDto employeeDto);

    EmployeeDto updateEmployee(String id, EmployeeDto employeeDto);

    EmployeeDto getEmployeeById(String id);

    EmployeeDto getEmployeeByEmail(String email);

    Page<EmployeeDto> getAllEmployees(String search, Pageable pageable);

    void deleteEmployee(String id);
}
