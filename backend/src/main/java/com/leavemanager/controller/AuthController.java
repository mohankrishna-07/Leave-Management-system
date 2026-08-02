package com.leavemanager.controller;

import com.leavemanager.dto.EmployeeDto;
import com.leavemanager.dto.LoginRequest;
import com.leavemanager.dto.LoginResponse;
import com.leavemanager.security.JwtTokenProvider;
import com.leavemanager.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmployeeService employeeService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, EmployeeService employeeService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.employeeService = employeeService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        EmployeeDto employeeDto = employeeService.getEmployeeByEmail(userDetails.getUsername());

        return ResponseEntity.ok(new LoginResponse(
                jwt,
                employeeDto.getId(),
                employeeDto.getName(),
                employeeDto.getEmail(),
                employeeDto.getRole(),
                employeeDto.getDepartment(),
                employeeDto.getLeaveBalance()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        EmployeeDto employeeDto = employeeService.getEmployeeByEmail(principal.getName());
        return ResponseEntity.ok(employeeDto);
    }
}
