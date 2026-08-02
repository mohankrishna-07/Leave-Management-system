package com.leavemanager.repository;

import com.leavemanager.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {

    // Fetch leaves for a specific employee
    Page<LeaveRequest> findByEmployeeId(String employeeId, Pageable pageable);

    // Fetch leaves by status (PENDING, APPROVED, REJECTED)
    Page<LeaveRequest> findByStatus(String status, Pageable pageable);

    // Search leaves by employee name or email
    Page<LeaveRequest> findByEmployeeNameContainingIgnoreCaseOrEmployeeEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    // Count queries for dashboards
    long countByEmployeeIdAndStatus(String employeeId, String status);

    long countByStatus(String status);
}
