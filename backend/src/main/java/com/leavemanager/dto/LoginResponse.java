package com.leavemanager.dto;

public class LoginResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private String id;
    private String name;
    private String email;
    private String role;
    private String department;
    private int leaveBalance;

    // Constructors
    public LoginResponse() {
    }

    public LoginResponse(String accessToken, String id, String name, String email, String role, String department, int leaveBalance) {
        this.accessToken = accessToken;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.leaveBalance = leaveBalance;
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getLeaveBalance() {
        return leaveBalance;
    }

    public void setLeaveBalance(int leaveBalance) {
        this.leaveBalance = leaveBalance;
    }
}
