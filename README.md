# LeaveEase — Modern Employee Leave Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**LeaveEase** is a full-stack enterprise leave management web application built with the **MERN** stack (MongoDB, Express.js, React, Node.js). Designed with a **Dual-Portal Architecture** and **Role-Based Access Control (RBAC)**, LeaveEase streamlines workplace absence tracking, live quota computation, and managerial review workflows.


---

## 🌟 Key Highlights & Standout Features

### 1. Dual-Portal Architecture with RBAC
* **Employee Portal**: Visual quota balance cards, smart application modal with real-time day calculation, filterable history table, and self-service cancellation for pending leaves.
* **Manager / Admin Portal**: Dedicated actionable approval queue, real-time KPI metrics, department overlap detection, comment/feedback modal, and manual employee quota adjustment.

### 2. Standout Business Logic (Viva / Portfolio Value)
* ⚡ **Sandwich Rule / Weekend Exclusion**: Automatically omits Saturdays and Sundays when computing `totalDays` between start and end dates.
* 🛡️ **Overlap Prevention**: Validates against conflicting `Pending` or `Approved` leaves in MongoDB before accepting new applications.
* 🔄 **Atomic Balance Deduction**: Real-time consistency — approving deducts working days from specific categories (`casual`, `sick`, `earned`), while rejecting retains the quota.
* 📧 **Automated Email Notifications**: Built-in **Nodemailer** integration notifying managers upon leave submission and employees upon decision approval/rejection (with graceful console fallback).

### 3. Interactive User Profile & Fast Demo Switcher
* **Top-Right Profile Drawer**: Displays Employee ID, Work Email, Department, Full-Time Employment Status, and live quota meters.
* **1-Click Instant Demo**: Switch between Employee (`Alex Morgan`) and Manager (`Sarah Jenkins`) directly from the Navbar or Login screen.

---

## 🛠️ Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router DOM, Axios, Lucide React |
| **Backend** | Node.js, Express.js, JSON Web Tokens (JWT), Bcryptjs, Nodemailer, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud M0 Cluster), Mongoose ODM |

---

## 📁 Project Directory Structure

```text
LeaveEase/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient Mongoose connection to MongoDB Atlas
│   ├── controllers/
│   │   ├── authController.js     # Register, Login (JWT), and User Profile
│   │   ├── leaveController.js    # Apply, History, Cancel, Review & Atomic Deduction
│   │   └── userController.js     # Employee Directory & Quota adjustments
│   ├── middleware/
│   │   └── authMiddleware.js     # protect (JWT verification) & managerOnly RBAC
│   ├── models/
│   │   ├── User.js               # User schema with leaveBalance, totalQuota & bcrypt hook
│   │   └── Leave.js              # Leave schema referencing User with status enum
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   ├── leaveRoutes.js        # /api/leaves endpoints
│   │   └── userRoutes.js         # /api/users endpoints
│   ├── utils/
│   │   ├── leaveCalculator.js    # Business days counter (excluding Sat/Sun) & overlap checker
│   │   └── emailService.js       # Nodemailer HTML templates & notification triggers
│   ├── .env                      # Server configuration & MongoDB connection string
│   ├── package.json
│   └── server.js                 # Express server entry point (Port 5000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with role badge & profile trigger
│   │   │   ├── ProfileModal.jsx  # Slide-in user profile details & quota summary
│   │   │   ├── ProtectedRoute.jsx# Role guard wrapper
│   │   │   └── StatusBadge.jsx   # Status indicator pills (Pending, Approved, Rejected)
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state, localStorage & Axios Bearer token
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Authentication form with instant demo buttons
│   │   │   ├── Register.jsx      # Employee & Manager onboarding with department picker
│   │   │   ├── EmployeeDashboard.jsx # Balance cards, Smart Apply modal, History table
│   │   │   └── ManagerDashboard.jsx  # KPI metrics, Approval queue, Remarks modal & Quota manager
│   │   ├── services/
│   │   │   └── api.js            # Centralized Axios client with auth interceptors
│   │   ├── App.jsx               # Application routes
│   │   └── index.css             # Tailwind CSS v4 configuration
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── SRS_DOCUMENTATION.md          # Comprehensive Software Requirements Specification
└── README.md                     # Project documentation & setup guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer)
* [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (or local MongoDB instance)

---

### Step 1: Clone & Configure Environment

1. Navigate to the `backend/` folder and verify your `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=leaveease_super_secret_jwt_key_sem5_2026
   CLIENT_URL=http://localhost:5173

   # Optional: Email Notifications (Gmail / SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

---

### Step 2: Install Dependencies

From the root `LeaveEase/` folder:

```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

---

### Step 3: Run the Application

Open two terminal windows:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
* Backend runs at: `http://localhost:5000`
* API Base URL: `http://localhost:5000/api`

#### Terminal 2 — Start Frontend Client:
```bash
cd frontend
npm run dev
```
* Frontend client opens at: `http://localhost:5173`

---

## 🔑 Demo Credentials (Instant Access)

The application provides instant demo credentials for rapid testing and viva evaluation:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Employee** | `alex@leaveease.com` | `password123` | Employee Portal (Apply, Balances, Track History) |
| **Manager** | `sarah.manager@leaveease.com` | `password123` | Manager Portal (Approval Queue, Directory, Quota Adjust) |

> You can also register real accounts on `http://localhost:5173/register` — new users are automatically hashed with `bcryptjs` and saved in MongoDB.

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Employee or Manager |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT token |
| `GET` | `/api/auth/profile` | Private | Retrieve logged-in user profile & balances |
| `POST` | `/api/leaves/apply` | Employee | Apply for leave (weekend exclusion & overlap checks) |
| `GET` | `/api/leaves/my-leaves` | Employee | Fetch personal leave history |
| `PUT` | `/api/leaves/:id/cancel`| Employee | Cancel pending leave application |
| `GET` | `/api/leaves/all` | Manager | Fetch all team leave requests with status/dept filters |
| `PUT` | `/api/leaves/:id/status`| Manager | Approve/Reject leave & atomically deduct balance |
| `GET` | `/api/users` | Manager | View staff directory & current leave quotas |
| `PUT` | `/api/users/:id/quota` | Manager | Adjust leave quota or allocate bonus days |

---

## 📄 License
This project is licensed under the MIT License — feel free to use and expand for academic and professional portfolios.
