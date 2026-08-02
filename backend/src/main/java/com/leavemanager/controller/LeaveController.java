package com.leavemanager.controller;

import com.leavemanager.dto.LeaveApplyRequest;
import com.leavemanager.dto.LeaveRequestDto;
import com.leavemanager.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping("/apply")
    public ResponseEntity<LeaveRequestDto> applyLeave(Principal principal, @Valid @RequestBody LeaveApplyRequest applyRequest) {
        LeaveRequestDto requestDto = leaveService.applyLeave(principal.getName(), applyRequest);
        return ResponseEntity.ok(requestDto);
    }

    @GetMapping("/my-history")
    public ResponseEntity<Page<LeaveRequestDto>> getMyLeaveHistory(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Retrieve leave requests sorted by application date descending
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("appliedOn").descending());
        Page<LeaveRequestDto> history = leaveService.getMyLeaveHistory(principal.getName(), pageRequest);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Long>> getMyStats(Principal principal) {
        Map<String, Long> stats = leaveService.getEmployeeDashboardStats(principal.getName());
        return ResponseEntity.ok(stats);
    }
}
