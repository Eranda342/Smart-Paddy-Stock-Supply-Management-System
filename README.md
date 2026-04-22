<div align="center">
  <img src="docs/images/navbar.svg" alt="AgroBridge Logo" width="120" />

  # AgroBridge

  **End-to-end paddy trading — from listing to delivery — on a single platform**

  [![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](#16-version)
  [![Status](https://img.shields.io/badge/status-stable-success.svg)](#)
  [![Stack](https://img.shields.io/badge/stack-MERN-informational.svg)](#3-tech-stack)
  [![License](https://img.shields.io/badge/license-Non--Commercial-red.svg)](#15-license)

  [View Repository](https://github.com/Eranda342/Smart-Paddy-Stock-Supply-Management-System) &nbsp;|&nbsp; [Report an Issue](https://github.com/Eranda342/Smart-Paddy-Stock-Supply-Management-System/issues)
</div>

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/Eranda342/Smart-Paddy-Stock-Supply-Management-System.git
cd Smart-Paddy-Stock-Supply-Management-System

# 2. Configure environment variables
cp backend/.env.example backend/.env   # fill in your values
# create frontend/.env — see Section 7

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Seed admin account (first run only)
cd ../backend && node seedAdmin.js

# 5. Start development servers (run in separate terminals)
cd backend  && npm run dev   # http://localhost:5000
cd frontend && npm run dev   # http://localhost:5173
```

---

## Key Highlights

- **Complete trade lifecycle** — Listing creation through negotiation, transaction confirmation, transport assignment, and delivery tracking in a single integrated flow
- **Real-time communication** — Socket.IO powers live negotiation chat, instant in-app notification delivery, and dispute chat without polling
- **Three-role system** — fully isolated dashboards and route guards for Farmer, Mill Owner, and Admin roles, enforced independently on both client and server
- **Glassmorphism UI** — dark-themed SaaS interface built with Tailwind CSS and Framer Motion; consistent glassmorphism design language across all role dashboards
- **Soft-delete architecture** — deleted user accounts are flagged, not removed; all historical transactions, negotiations, and disputes remain intact and queryable
- **Multi-layer authentication** — email verification (Nodemailer), JWT session management, and Google OAuth 2.0 supported in parallel
- **Analytics and reporting** — admin analytics dashboard with PDF (jsPDF) and Excel (ExcelJS) export capability

---

## 1. Overview

AgroBridge digitises Sri Lanka's paddy supply chain by providing a structured, transparent marketplace where farmers and mill owners can trade directly. The platform covers the entire transaction lifecycle — from stock listing and price negotiation through to transport coordination and delivery confirmation — without requiring off-platform communication.

**Designed for three user roles:**

| Role | Primary Responsibility |
| :--- | :--- |
| **Farmer** | List paddy stock, respond to buy requests, negotiate, track deliveries |
| **Mill Owner** | Discover listings, raise buy requests, negotiate, manage logistics |
| **Admin** | Verify users, oversee all activity, resolve disputes, monitor analytics |

---

## 2. Features

### Farmer

- Create, edit, and manage paddy listings with price, quantity, and location details
- Browse mill owner buy requests and respond directly
- Engage in real-time price negotiations via an interactive chat interface
- Track active and completed transactions with full history
- Coordinate transport and monitor delivery status
- Raise formal complaints through the dispute system

### Mill Owner

- Post targeted buy requests for specific paddy varieties
- Browse and filter the full farmer listing marketplace
- Negotiate terms directly with farmers
- Manage vehicles and coordinate logistics
- Track purchases, transport assignments, and transaction history

### Admin

- Manage all user accounts; approve or reject business verifications
- Oversee all listings, negotiations, and transactions platform-wide
- Handle disputes between farmers and mill owners
- Broadcast system-wide announcements
- View analytics dashboards with export capability (PDF and Excel)
- Configure system settings and maintenance mode

### Platform-Wide

- Email verification required before account activation
- Google OAuth 2.0 login and registration
- Real-time in-app notifications via Socket.IO
- Role-based access control with protected routes (client and server)
- Soft-delete system preserving historical data integrity
- PDF and Excel report generation
- Dark-themed glassmorphism UI with animated transitions (Framer Motion)

---

## 3. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, React Router v6, Axios, Socket.IO client |
| **Backend** | Node.js, Express 5, Socket.IO |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), Passport.js, Google OAuth 2.0, bcryptjs |
| **HTTP / Config** | Axios (client), cors, dotenv |
| **Email** | Nodemailer (Gmail App Password) |
| **File Uploads** | Multer |
| **Scheduling** | node-cron |
| **Reports** | jsPDF, jspdf-autotable, ExcelJS |
| **UI / Design** | Glassmorphism design system, dark SaaS theme, Framer Motion animations |
| **API Docs** | Swagger UI (development only) |

---

## 4. Architecture Overview

AgroBridge uses a standard client-server architecture with a persistent real-time layer:

- **Frontend** — React 18 SPA bundled with Vite. All API calls are made via Axios to the Express REST API. A persistent Socket.IO WebSocket connection is established on login for real-time event delivery.
- **Backend** — Node.js/Express 5 server exposing a structured REST API organised by resource (users, listings, negotiations, transactions, transport, disputes, analytics, notifications). Handles authentication middleware, file uploads (Multer), scheduled background jobs (node-cron), and Socket.IO event emission.
- **Database** — MongoDB accessed via Mongoose ODM. Active schemas: `User`, `Listing`, `Negotiation`, `Transaction`, `Transport`, `Vehicle`, `Dispute`, `DisputeChat`, `Notification`, `Announcement`, `SystemSetting`.
- **Real-time layer** — Socket.IO rooms are used to scope events to the relevant participants. Events emitted include: negotiation offer/counter/accept/reject, in-app notification delivery, and dispute chat messages.
- **UI/UX** — Dark-themed glassmorphism design system implemented with Tailwind CSS utility classes. Animated transitions and micro-interactions delivered via Framer Motion.

---

## 4a. System Flow

The core platform workflow progresses through five ordered stages:

```
Listing  →  Negotiation  →  Transaction  →  Transport  →  Delivery
```

| Stage | Actor(s) | Description |
| :--- | :--- | :--- |
| **Listing** | Farmer | Farmer creates a paddy listing specifying variety, quantity, price, and location. Mill Owner can also post a buy request. |
| **Negotiation** | Farmer + Mill Owner | Either party initiates a negotiation. Offers and counter-offers are exchanged in real time via Socket.IO chat. When both parties agree, the negotiation is marked accepted. |
| **Transaction** | System | An accepted negotiation automatically generates a Transaction record linking both parties, the listing, and the agreed terms. |
| **Transport** | Mill Owner + Driver | The Mill Owner assigns a vehicle and driver to the transaction. Transport status is updated through pickup, in-transit, and delivered stages. |
| **Delivery** | Both parties | Delivery is confirmed and the transaction is closed. Full history is preserved for both parties and visible to Admin. |

---

## 4b. Real-Time System

Socket.IO is integrated throughout the platform to eliminate polling and provide an interactive experience:

- **Negotiation chat** — each negotiation has a dedicated Socket.IO room. Offer submissions, counter-offers, acceptances, and rejections are pushed instantly to both participants.
- **In-app notifications** — server-side events (e.g. new negotiation offer, transaction created, dispute opened) emit a notification event to the target user's socket room. The notification is simultaneously persisted to the `Notification` collection in MongoDB.
- **Dispute chat** — open disputes have a dedicated real-time chat channel between the affected parties and the Admin, backed by the `DisputeChat` model.
- **Connection management** — users join personal socket rooms on authentication. Rooms are identified by user ID, ensuring notifications are delivered only to the correct recipient.

---

## 4c. Data Integrity & Soft-Delete

AgroBridge implements a non-destructive account deletion model:

- When an Admin deletes a user account, the `User` document is **flagged** with a `isDeleted: true` field — it is never removed from the database.
- All associated records (Listings, Negotiations, Transactions, Disputes) that reference the deleted user remain intact and continue to resolve correctly.
- Auth middleware blocks deleted users from logging in or making API calls immediately upon deletion.
- The Admin panel displays deleted users distinctly (labelled "Deleted User") to preserve visibility into historical platform activity.
- This design prevents orphaned references, broken history views, and data loss while still achieving the operational effect of account removal.

---

## 5. Folder Structure

```
Smart-Paddy-Stock-Supply-Management-System/
├── backend/
│   ├── config/          # Database connection, Passport strategy
│   ├── controllers/     # Route handler logic
│   ├── middleware/       # Auth guards, role checks, error handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── jobs/            # node-cron scheduled tasks
│   ├── utils/           # Shared helpers (email, tokens, etc.)
│   ├── uploads/         # Multer upload destination
│   ├── docs/            # Swagger API specification
│   ├── server.js        # Entry point
│   └── .env.example     # Environment variable template
│
├── frontend/
│   └── src/
│       ├── api/         # Axios API client modules
│       ├── app/
│       │   ├── pages/   # Route-level components (farmer/, mill-owner/, admin/)
│       │   ├── layouts/ # Role-specific layout wrappers
│       │   ├── contexts/# React context providers
│       │   └── routes.jsx
│       ├── components/  # Shared UI components
│       ├── constants/   # Static data (paddy types, categories, etc.)
│       ├── assets/      # Images, icons, paddy variety photos
│       ├── styles/      # Global CSS
│       └── utils/       # Frontend helpers (PDF generator, formatters)
│
└── docs/
    └── images/          # README screenshots
```

---

## 6. Screenshots

### Landing Page

<img src="docs/images/landing.png" alt="Landing Page" width="800"/>

<br/>

### Farmer Dashboard

<img src="docs/images/farmer-dashboard.png" alt="Farmer Dashboard" width="800"/>

<br/>

### Mill Owner Dashboard

<img src="docs/images/mill-owner-dashboard.png" alt="Mill Owner Dashboard" width="800"/>

<br/>

### Admin Dashboard

<img src="docs/images/admin-dashboard.png" alt="Admin Dashboard" width="800"/>

<br/>

### Negotiations

<img src="docs/images/negotiations.png" alt="Negotiations" width="800"/>

---

## 7. Environment Variables

### Backend — `backend/.env`

Copy `backend/.env.example` to `backend/.env` and supply the values below.

```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/paddy_system

# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=your_strong_random_secret

# Email (Gmail App Password)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
FROM_NAME=AgroBridge

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> Generate a cryptographically strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

---

## 8. Installation & Setup

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local instance or MongoDB Atlas URI)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/Eranda342/Smart-Paddy-Stock-Supply-Management-System.git
cd Smart-Paddy-Stock-Supply-Management-System
```

**2. Configure environment variables**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
# Create frontend/.env using the variables listed in Section 7
```

**3. Install backend dependencies**

```bash
cd backend
npm install
```

**4. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

**5. Seed the admin account** _(first run only)_

```bash
cd ../backend
node seedAdmin.js
```

**6. Start development servers** _(run in separate terminals)_

```bash
# Terminal 1 — backend
cd backend && npm run dev       # http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev      # http://localhost:5173
```

---

## 9. Production Build

**Frontend**

```bash
cd frontend
npm run build
```

Optimised output is placed in `frontend/dist/`. Serve it with Vercel, Nginx, or Azure Static Web Apps.

**Backend**

```bash
cd backend
npm start
```

Runs `node server.js` without file-watching.

---

## 10. Deployment

| Component | Recommended Option |
| :--- | :--- |
| **Database** | MongoDB Atlas (M0 free tier or above) |
| **Backend** | Azure App Service, Railway, or Render |
| **Frontend** | Vercel or Azure Static Web Apps |

**Checklist before going live:**

1. Set all environment variables in the hosting provider's dashboard — never deploy `.env` files.
2. Update `FRONTEND_URL` and `VITE_API_URL` to production domain URLs.
3. Add the production frontend URL to the Google Cloud Console OAuth 2.0 authorised redirect URIs.
4. Restrict the CORS origin whitelist to the production frontend domain.

---

## 11. Security & Reliability

- **JWT Authentication** — stateless, short-lived access tokens validated on every protected route
- **Role-Based Access Control** — middleware guards for `FARMER`, `MILL_OWNER`, and `ADMIN`; enforced independently on both client and server
- **Google OAuth 2.0** — passport-google-oauth20 strategy with secure callback and token exchange
- **Email Verification** — accounts are blocked from all actions until the email address is confirmed
- **Soft-Delete System** — user deletions are non-destructive; all related transactions, negotiations, and disputes are preserved
- **Input Validation** — server-side validation on all state-mutating endpoints
- **CORS Protection** — explicit origin whitelist via the `cors` middleware
- **File Upload Restrictions** — Multer enforces file type and size limits
- **Password Security** — bcryptjs hashing with appropriate salt rounds

---

## 12. Known Limitations

- **No server-side pagination** — list endpoints return full datasets; performance degrades with large collections
- **Large frontend bundle** — the main JS chunk exceeds 500 kB (surfaced during `vite build`); code-splitting is a planned improvement
- **Swagger configuration** — API documentation is hardcoded to `localhost` and requires manual adjustment for production use
- **SMS notifications** — transport milestone alerts are mocked; no live Twilio or equivalent SMS integration exists

---

## 13. Future Improvements

- Server-side pagination and cursor-based infinite scroll
- Frontend code-splitting and lazy loading for bundle size reduction
- Improved mobile responsiveness across all role dashboards
- Live SMS notifications via Twilio or a local Sri Lankan SMS gateway
- AI-assisted price recommendations derived from historical transaction data
- Secure payment gateway integration
- Environment-variable-driven Swagger host configuration for production

---

## 14. Author

**Eranda Buddhika**
Undergraduate, Computer Science

[github.com/Eranda342](https://github.com/Eranda342) &nbsp;|&nbsp; [Project Repository](https://github.com/Eranda342/Smart-Paddy-Stock-Supply-Management-System)

---

## 15. License

**Custom License — Non-Commercial Use Only**

Copyright (c) 2026 Eranda Buddhika

This project is provided for **educational and portfolio purposes only**.

### Permissions

You are allowed to:

- View and study the source code
- Fork and modify the project for **personal or academic use**
- Use parts of the code for learning or reference (with attribution)

### Restrictions

You are **NOT allowed to**:

- Use this project for **commercial purposes**
- Sell, resell, or monetize this project
- Host, deploy, or distribute this project as a **product or service**
- Use this system in a business environment without explicit written permission

### Commercial Use

If you wish to use this project commercially, you must obtain **written permission** from the author.

Contact: erandabuddhika007@gmail.com

This project is intended to showcase full-stack development skills and real-world system design based on Sri Lanka's agricultural supply chain.

---

## 16. Version

| Release | Date | Notes |
| :--- | :--- | :--- |
| **v1.0.0** | April 2026 | First stable release — full trading lifecycle, real-time negotiation, three-role dashboards, dispute system, analytics export |