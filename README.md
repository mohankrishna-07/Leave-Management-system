# Leave Management System (LMS)

A clean, simple, and professional Full-Stack Leave Management System built using **Spring Boot (Java 21)** and **React (Vite + Bootstrap)**. 

To prevent local storage session collisions and provide a secure, clear architectural separation, the frontend is split into two distinct portals:
1. **Employee Portal (`employee-portal`)**: Runs on port `5173`.
2. **Admin Portal (`admin-portal`)**: Runs on port `5174`.

This structure allows you to run both portals side-by-side in normal tabs of the same browser without session conflicts!

---

## Folder Structure

```
Leave Management/
├── backend/                    # Spring Boot REST API (Port 8080)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/leavemanager/
│   │   │   │   ├── config/             # DB initializers & password configuration
│   │   │   │   ├── security/           # JWT & Spring Security Filters
│   │   │   │   ├── entity/             # JPA Entities (Employee, LeaveRequest)
│   │   │   │   ├── repository/         # Data repositories
│   │   │   │   ├── dto/                # Request/Response payloads
│   │   │   │   ├── service/            # Service layer
│   │   │   │   └── controller/         # REST Controllers
│   │   │   └── resources/
│   │   │       ├── application.properties    # MySQL Configuration (Default)
│   │   │       └── application-h2.properties # H2 In-Memory DB configuration
│   └── pom.xml                 # Maven dependencies
│
├── employee-portal/            # Employee Web Application (Port 5173)
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar (Employee-only links), ProtectedRoute, Toast
│   │   ├── context/            # AuthContext (Handles Login / Session checks)
│   │   ├── pages/
│   │   │   ├── Login.jsx      # Employee Login Page (blocks Admin login attempts)
│   │   │   ├── Dashboard.jsx  # Employee Dashboard view (balances, history summary)
│   │   │   ├── Profile.jsx    # View & Update profile details
│   │   │   └── ApplyLeave.jsx # Request Leave Form (shows real-time days count)
│   │   └── App.jsx            # Routing configurations (Employee paths)
│
└── admin-portal/               # Admin Web Application (Port 5174)
    ├── src/
    │   ├── components/         # Navbar, Sidebar (Admin-only links), ProtectedRoute, Toast
    │   ├── context/            # AuthContext (Handles Login / Session checks)
    │   ├── pages/
    │   │   ├── Login.jsx      # Admin Login Page (blocks Employee login attempts)
    │   │   ├── Dashboard.jsx  # Admin Dashboard view (aggregate metrics)
    │   │   ├── Profile.jsx    # View & Update profile details
    │   │   ├── ManageEmployees.jsx # Employee CRUD management (Add/Edit/Delete)
    │   │   └── LeaveRequests.jsx   # List of all requests (Approve/Reject actions)
    │   └── App.jsx            # Routing configurations (Admin paths)
```

---

## Database Schema

The database consists of two tables linked through a one-to-many relationship:

### 1. `employee`
Stores information about employees and system administrators:
* `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique identifier.
* `name` (VARCHAR(100), NOT NULL): Employee's full name.
* `email` (VARCHAR(100), NOT NULL, UNIQUE): Email used for logging in.
* `password` (VARCHAR(255), NOT NULL): BCrypt-encrypted login credentials.
* `role` (VARCHAR(20), NOT NULL): `EMPLOYEE` or `ADMIN`.
* `department` (VARCHAR(50), NOT NULL): Corporate department name.
* `leave_balance` (INT, NOT NULL, DEFAULT 30): Available leave days.

### 2. `leave_request`
Stores information about leave applications:
* `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique identifier.
* `employee_id` (BIGINT, FOREIGN KEY referencing `employee(id)`): Link to the employee requesting the leave.
* `start_date` (DATE, NOT NULL): First day of leave.
* `end_date` (DATE, NOT NULL): Last day of leave.
* `leave_type` (VARCHAR(50), NOT NULL): e.g., `Casual Leave`, `Sick Leave`, `Earned Leave`.
* `reason` (TEXT, NOT NULL): Reason statement for applying.
* `status` (VARCHAR(20), NOT NULL, DEFAULT `PENDING`): Current state (`PENDING`, `APPROVED`, or `REJECTED`).
* `rejection_reason` (VARCHAR(255), NULLABLE): Mandatory reason explaining rejection.
* `applied_on` (TIMESTAMP, NOT NULL): System timestamp when applied.

---

## REST API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT token + user details |
| `GET` | `/api/auth/me` | Authenticated | Gets the currently logged-in user's profile |

### Employee Self-Service (Roles: EMPLOYEE, ADMIN)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/employee/profile` | Authenticated | Gets the current user's profile and leave balances |
| `PUT` | `/api/employee/profile` | Authenticated | Updates personal info (name, email, password - optional) |
| `POST` | `/api/leaves/apply` | Employee Only | Submits a new leave request (calculates and checks balance) |
| `GET` | `/api/leaves/my-history` | Employee Only | Gets paginated leave history of current employee |
| `GET` | `/api/leaves/my-stats` | Employee Only | Gets current employee's dashboard counters |

### Administrator Operations (Role: ADMIN)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin Only | Gets aggregate stats (Total employees, requests, pending, approved) |
| `GET` | `/api/admin/employees` | Admin Only | Retrieves paginated and searchable list of employees |
| `POST` | `/api/admin/employees` | Admin Only | Registers a new employee into the system |
| `PUT` | `/api/admin/employees/{id}` | Admin Only | Modifies employee profile details (including password and balance) |
| `DELETE` | `/api/admin/employees/{id}` | Admin Only | Deletes employee from the system |
| `GET` | `/api/admin/leaves` | Admin Only | Retrieves paginated list of all leave requests (searchable) |
| `PUT` | `/api/admin/leaves/{id}/approve`| Admin Only | Approves a request and deducts leave days from employee balance |
| `PUT` | `/api/admin/leaves/{id}/reject` | Admin Only | Rejects a request (expects a JSON body with `rejectionReason`) |

---

## Setup & Run Instructions

### Prerequisites
* Java JDK 21 (or newer) installed.
* Node.js (v18 or newer) and npm installed.

---

### Step 1: Start the Backend (H2 In-Memory Mode)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Run the application using the Maven wrapper:
   ```bash
   .\mvnw spring-boot:run "-Dspring-boot.run.profiles=h2"
   ```
The backend seeds the following credentials automatically upon startup:
* **Administrator:** `admin@company.com` / `admin123`
* **Employees:** `john@company.com` or `jane@company.com` / `employee123`

---

### Step 2: Start the Employee Portal
1. Open a new terminal and navigate to the employee-portal folder:
   ```bash
   cd employee-portal
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
*The Employee Portal will load at [http://localhost:5173](http://localhost:5173).*

---

### Step 3: Start the Admin Portal
1. Open a new terminal and navigate to the admin-portal folder:
   ```bash
   cd admin-portal
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
*The Admin Portal will load at [http://localhost:5174](http://localhost:5174).*
