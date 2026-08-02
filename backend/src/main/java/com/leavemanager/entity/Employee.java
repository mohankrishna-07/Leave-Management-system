package com.leavemanager.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Document(collection = "employee")
public class Employee {

    @Id
    private String id;

    @NotBlank
    @Size(max = 100)

    private String name;

    @NotBlank
    @Email
    @Size(max = 100)

    private String email;

    @NotBlank
    @Size(max = 255)

    private String password;

    @NotBlank
    @Size(max = 20)

    private String role; // 'EMPLOYEE' or 'ADMIN'

    @NotBlank
    @Size(max = 50)

    private String department;


    private int leaveBalance = 30;

    // Constructors
    public Employee() {
    }

    public Employee(String name, String email, String password, String role, String department, int leaveBalance) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.leaveBalance = leaveBalance;
    }

    // Getters and Setters
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
