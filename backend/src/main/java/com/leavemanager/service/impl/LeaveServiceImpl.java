package com.leavemanager.service.impl;

import com.leavemanager.dto.LeaveApplyRequest;
import com.leavemanager.dto.LeaveRequestDto;
import com.leavemanager.entity.Employee;
import com.leavemanager.entity.LeaveRequest;
import com.leavemanager.exception.InvalidLeaveException;
import com.leavemanager.exception.ResourceNotFoundException;
import com.leavemanager.repository.EmployeeRepository;
import com.leavemanager.repository.LeaveRequestRepository;
import com.leavemanager.service.LeaveService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;

    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository, EmployeeRepository employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public LeaveRequestDto applyLeave(String employeeEmail, LeaveApplyRequest applyRequest) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        if (applyRequest.getStartDate().isAfter(applyRequest.getEndDate())) {
            throw new InvalidLeaveException("Start date cannot be after end date");
        }

        // Validate that leave duration is at least 1 day
        long leaveDays = ChronoUnit.DAYS.between(applyRequest.getStartDate(), applyRequest.getEndDate()) + 1;
        if (leaveDays <= 0) {
            throw new InvalidLeaveException("Leave duration must be at least 1 day");
        }

        // Check if employee has sufficient leave balance before requesting
        if (employee.getLeaveBalance() < leaveDays) {
            throw new InvalidLeaveException("Insufficient leave balance. Requested: " + leaveDays + 
                    " days, Available: " + employee.getLeaveBalance() + " days");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setStartDate(applyRequest.getStartDate());
        leaveRequest.setEndDate(applyRequest.getEndDate());
        leaveRequest.setLeaveType(applyRequest.getLeaveType());
        leaveRequest.setReason(applyRequest.getReason());
        leaveRequest.setStatus("PENDING");
        leaveRequest.setAppliedOn(LocalDateTime.now());

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return mapToDto(savedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getMyLeaveHistory(String employeeEmail, Pageable pageable) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        return leaveRequestRepository.findByEmployeeId(employee.getId(), pageable).map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveRequestDto> getAllLeaveRequests(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return leaveRequestRepository.findByEmployeeNameContainingIgnoreCaseOrEmployeeEmailContainingIgnoreCase(
                    search.trim(), search.trim(), pageable).map(this::mapToDto);
        }
        return leaveRequestRepository.findAll(pageable).map(this::mapToDto);
    }

    @Override
    public LeaveRequestDto approveLeave(String leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!"PENDING".equalsIgnoreCase(leaveRequest.getStatus())) {
            throw new InvalidLeaveException("Only PENDING leave requests can be approved. Current status: " + leaveRequest.getStatus());
        }

        Employee employee = leaveRequest.getEmployee();
        long leaveDays = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;

        if (employee.getLeaveBalance() < leaveDays) {
            throw new InvalidLeaveException("Cannot approve leave. Employee has insufficient leave balance. " +
                    "Requested: " + leaveDays + " days, Available: " + employee.getLeaveBalance() + " days");
        }

        // Deduct leave balance
        employee.setLeaveBalance(employee.getLeaveBalance() - (int) leaveDays);
        employeeRepository.save(employee);

        // Update leave request status
        leaveRequest.setStatus("APPROVED");
        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

        return mapToDto(updatedRequest);
    }

    @Override
    public LeaveRequestDto rejectLeave(String leaveId, String rejectionReason) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!"PENDING".equalsIgnoreCase(leaveRequest.getStatus())) {
            throw new InvalidLeaveException("Only PENDING leave requests can be rejected. Current status: " + leaveRequest.getStatus());
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new InvalidLeaveException("Rejection reason is required");
        }

        leaveRequest.setStatus("REJECTED");
        leaveRequest.setRejectionReason(rejectionReason.trim());
        LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

        return mapToDto(updatedRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getEmployeeDashboardStats(String employeeEmail) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + employeeEmail));

        Map<String, Long> stats = new HashMap<>();
        stats.put("leaveBalance", (long) employee.getLeaveBalance());
        stats.put("pendingLeaves", leaveRequestRepository.countByEmployeeIdAndStatus(employee.getId(), "PENDING"));
        stats.put("approvedLeaves", leaveRequestRepository.countByEmployeeIdAndStatus(employee.getId(), "APPROVED"));
        stats.put("rejectedLeaves", leaveRequestRepository.countByEmployeeIdAndStatus(employee.getId(), "REJECTED"));
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getAdminDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployees", employeeRepository.count());
        stats.put("totalRequests", leaveRequestRepository.count());
        stats.put("pendingRequests", leaveRequestRepository.countByStatus("PENDING"));
        stats.put("approvedRequests", leaveRequestRepository.countByStatus("APPROVED"));
        stats.put("rejectedRequests", leaveRequestRepository.countByStatus("REJECTED"));

        return stats;
    }

    // Helper method to convert Entity to DTO
    private LeaveRequestDto mapToDto(LeaveRequest request) {
        return new LeaveRequestDto(
                request.getId(),
                request.getEmployee().getId(),
                request.getEmployee().getName(),
                request.getEmployee().getEmail(),
                request.getEmployee().getDepartment(),
                request.getStartDate(),
                request.getEndDate(),
                request.getLeaveType(),
                request.getReason(),
                request.getStatus(),
                request.getRejectionReason(),
                request.getAppliedOn()
        );
    }
}
