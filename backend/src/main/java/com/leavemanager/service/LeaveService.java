package com.leavemanager.service;

import com.leavemanager.dto.LeaveApplyRequest;
import com.leavemanager.dto.LeaveRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;

public interface LeaveService {

    LeaveRequestDto applyLeave(String employeeEmail, LeaveApplyRequest applyRequest);

    Page<LeaveRequestDto> getMyLeaveHistory(String employeeEmail, Pageable pageable);

    Page<LeaveRequestDto> getAllLeaveRequests(String search, Pageable pageable);

    LeaveRequestDto approveLeave(String leaveId);

    LeaveRequestDto rejectLeave(String leaveId, String rejectionReason);

    Map<String, Long> getEmployeeDashboardStats(String employeeEmail);

    Map<String, Long> getAdminDashboardStats();
}
