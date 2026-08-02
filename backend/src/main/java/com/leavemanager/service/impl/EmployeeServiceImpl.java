package com.leavemanager.service.impl;

import com.leavemanager.dto.EmployeeDto;
import com.leavemanager.entity.Employee;
import com.leavemanager.exception.InvalidLeaveException;
import com.leavemanager.exception.ResourceNotFoundException;
import com.leavemanager.repository.EmployeeRepository;
import com.leavemanager.service.EmployeeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        if (employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new InvalidLeaveException("Email '" + employeeDto.getEmail() + "' is already registered");
        }

        if (employeeDto.getPassword() == null || employeeDto.getPassword().trim().isEmpty()) {
            throw new InvalidLeaveException("Password is required for a new employee");
        }

        Employee employee = new Employee();
        employee.setName(employeeDto.getName());
        employee.setEmail(employeeDto.getEmail());
        employee.setPassword(passwordEncoder.encode(employeeDto.getPassword().trim()));
        employee.setRole(employeeDto.getRole());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setLeaveBalance(employeeDto.getLeaveBalance());

        Employee savedEmployee = employeeRepository.save(employee);
        return mapToDto(savedEmployee);
    }

    @Override
    public EmployeeDto updateEmployee(String id, EmployeeDto employeeDto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        // Check email uniqueness if email is modified
        if (!employee.getEmail().equalsIgnoreCase(employeeDto.getEmail()) &&
                employeeRepository.existsByEmail(employeeDto.getEmail())) {
            throw new InvalidLeaveException("Email '" + employeeDto.getEmail() + "' is already registered");
        }

        employee.setName(employeeDto.getName());
        employee.setEmail(employeeDto.getEmail());
        employee.setRole(employeeDto.getRole());
        employee.setDepartment(employeeDto.getDepartment());
        employee.setLeaveBalance(employeeDto.getLeaveBalance());

        // Update password only if provided
        if (employeeDto.getPassword() != null && !employeeDto.getPassword().trim().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(employeeDto.getPassword().trim()));
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return mapToDto(updatedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));
        return mapToDto(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(String search, Pageable pageable) {
        Page<Employee> employeesPage;
        if (search != null && !search.trim().isEmpty()) {
            employeesPage = employeeRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            employeesPage = employeeRepository.findAll(pageable);
        }
        return employeesPage.map(this::mapToDto);
    }

    @Override
    public void deleteEmployee(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(employee);
    }

    // Helper method to convert Entity to DTO
    private EmployeeDto mapToDto(Employee employee) {
        return new EmployeeDto(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getDepartment(),
                employee.getLeaveBalance()
        );
    }
}
