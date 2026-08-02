package com.leavemanager.config;

import com.leavemanager.entity.Employee;
import com.leavemanager.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed default Admin if not exists
        if (!employeeRepository.existsByEmail("admin@company.com")) {
            Employee admin = new Employee();
            admin.setName("System Admin");
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setDepartment("IT Administration");
            admin.setLeaveBalance(0); // Admin does not apply for leave in this context
            employeeRepository.save(admin);
            System.out.println("Seeded default Administrator account: admin@company.com / admin123");
        }

        // Seed default Employee 1 if not exists
        if (!employeeRepository.existsByEmail("john@company.com")) {
            Employee employee1 = new Employee();
            employee1.setName("John Doe");
            employee1.setEmail("john@company.com");
            employee1.setPassword(passwordEncoder.encode("employee123"));
            employee1.setRole("EMPLOYEE");
            employee1.setDepartment("Human Resources");
            employee1.setLeaveBalance(30);
            employeeRepository.save(employee1);
            System.out.println("Seeded default Employee account: john@company.com / employee123");
        }

        // Seed default Employee 2 if not exists
        if (!employeeRepository.existsByEmail("jane@company.com")) {
            Employee employee2 = new Employee();
            employee2.setName("Jane Smith");
            employee2.setEmail("jane@company.com");
            employee2.setPassword(passwordEncoder.encode("employee123"));
            employee2.setRole("EMPLOYEE");
            employee2.setDepartment("Engineering");
            employee2.setLeaveBalance(30);
            employeeRepository.save(employee2);
            System.out.println("Seeded default Employee account: jane@company.com / employee123");
        }
    }
}
