# Smart Paddy Stock & Supply Management System

## 📌 Project Overview

The Smart Paddy Stock & Supply Management System is a web-based platform developed to digitally connect farmers and rice mill owners within a structured and transparent trading environment.

The system enables farmers to sell paddy stocks and mill owners to publish buying requests. It supports negotiation, transaction confirmation, and transport coordination, including vehicle aggregation for multiple nearby farmers.

This project is developed as part of a Final Year Undergraduate Degree Programme.

---

## 🎯 Problem Statement

Traditional paddy trading processes rely heavily on intermediaries, informal communication, and manual coordination. This results in:

- Limited price transparency
- Inefficient negotiation processes
- Risk of fake or unverified participants
- Poor transport coordination
- Lack of structured transaction records

This system aims to digitally transform the paddy trading workflow while maintaining realistic agricultural practices.

---

## 🎯 Project Objectives

- Provide a centralized digital marketplace for paddy trading
- Enable direct interaction between farmers and mill owners
- Implement secure role-based access control
- Support structured negotiation and transaction recording
- Integrate transport coordination functionality
- Ensure user authenticity through admin verification

---

## 👥 User Roles

### 1️⃣ Farmer
- Register and manage profile
- Add NIC details during registration
- Post paddy stock listings (SELL)
- View mill owner buying posts (BUY)
- Negotiate deals via messaging
- Confirm transactions
- Request transport services
- Track transport status

---

### 2️⃣ Rice Mill Owner
- Register with business verification details
- Post buying requests
- View farmer selling listings
- Negotiate pricing and quantity
- Confirm transactions
- Assign transport vehicles
- Manage multiple farmer pickups in a single route

---

### 3️⃣ Administrator
- Approve or reject user registrations
- Verify mill owner business documents
- Monitor system users
- Maintain system integrity

---

## 🏗️ System Architecture

The system follows a layered web architecture:

- **User Layer** – Farmer, Mill Owner, Admin
- **Presentation Layer** – Web Application Interface
- **Application Layer** – Backend Services
  - Authentication & Authorization
  - User Verification
  - Listing Management
  - Negotiation Management
  - Transaction Management
  - Transport Coordination
  - Notification Services
- **Data Layer** – MongoDB Database

External integrations:
- Maps / Location API (for transport tracking)
- Email & SMS notification services

---

## 🗄️ Database Design (MongoDB)

The system uses MongoDB (NoSQL) for flexible and scalable data management.

### Main Collections:
- `users`
- `listings`
- `negotiations`
- `transactions`
- `transports`
- `notifications`

Embedded documents are used for negotiation messages, while references are used for transactions and transport aggregation.

---

## 🚛 Transport Coordination Feature

The system supports:
- Optional transport requests
- Vehicle assignment by mill owners
- Batch pickup for multiple farmers located in nearby areas
- Transaction-linked transport records

---

## 🛠️ Technologies Used

- Backend: Node.js (Planned)
- Database: MongoDB
- UI/UX Design: Figma
- Version Control: Git & GitHub
- API Architecture: RESTful Services

---

## 📂 Project Status

✔ Project Initiation Document (PID) Completed  
✔ System Design Completed  
✔ Architecture Finalized  
🔄 Database Implementation In Progress  
🔄 UI Design In Progress  

---

## 📚 Academic Context

This project is developed as a final year academic requirement.  
The system focuses on demonstrating functional feasibility rather than full commercial deployment.

---

## 👨‍🎓 Author

Eranda Buddhika  
Final Year Undergraduate Project  
Smart Paddy Stock & Supply Management System
