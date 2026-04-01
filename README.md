🌾 AgroBridge – Smart Paddy Trading & Supply Management System

AgroBridge is a full-stack, real-time platform that connects farmers and mill owners to streamline paddy trading, negotiations, transport logistics, and dispute resolution with a centralized admin control system.

⸻

🚀 Key Features

👨‍🌾 Farmer & Mill Owner Portals
	•	User registration & authentication (JWT-based)
	•	Create and manage listings
	•	Browse marketplace listings
	•	Real-time negotiation system
	•	Transaction tracking
	•	Transport tracking (delivery lifecycle)
	•	Notification system (real-time updates)

⸻

🛠️ Admin Dashboard
	•	User management & verification (KYC approval system)
	•	Listings moderation
	•	Transactions & negotiations monitoring
	•	Transport management overview
	•	Dispute resolution system (multi-stage workflow)
	•	Notifications center (broadcast system)
	•	Reports & analytics dashboard
	•	System settings (dynamic platform control)

⸻

📎 Dispute & Complaint System
	•	Raise disputes with detailed description
	•	Upload proof (images/documents)
	•	Admin review panel with evidence viewer
	•	Internal case tracking workflow:
	•	OPEN → REVIEW → INVESTIGATION → RESOLVED

⸻

🔔 Real-Time Notification System
	•	Socket.IO powered live updates
	•	Admin announcements (targeted: Farmers / Mill Owners / All)
	•	Per-user notification delivery (socket rooms)
	•	Notification dropdown with read/unread tracking

⸻

⚙️ Dynamic System Settings
	•	Platform fee configuration
	•	Auto dispute trigger (cron-based)
	•	Max listings per user
	•	Maintenance mode (global system lock)
	•	All settings stored in MongoDB and applied system-wide

⸻

📊 Reports & Analytics
	•	Platform revenue tracking
	•	User growth analytics
	•	Paddy distribution insights
	•	Transaction and negotiation statistics
	•	Export reports (PDF / Excel)

⸻

🏗️ Tech Stack

Frontend
	•	React (Vite)
	•	Tailwind CSS
	•	Context API
	•	Socket.IO Client

  ⸻

Backend
	•	Node.js
	•	Express.js
	•	MongoDB (Mongoose)
	•	Socket.IO
	•	Multer (file uploads)
	•	Node-cron (automation)

⸻

🔄 System Architecture
	•	REST API driven backend
	•	Real-time communication via WebSockets
	•	MongoDB for persistent storage
	•	Modular MVC structure
	•	Global configuration via System Settings

⸻

📁 Project Structure
backend/
 ├── models/
 ├── controllers/
 ├── routes/
 ├── middleware/
 ├── config/
 └── server.js

frontend/
 ├── src/
 │   ├── pages/
 │   ├── layouts/
 │   ├── components/
 │   ├── contexts/
 │   └── api/

⸻

⚡ Installation & Setup

1. Clone the repository

git clone https://github.com/your-username/agrobridge.git
cd agrobridge

⸻

2. Backend Setup
cd backend
npm install
npm run dev

⸻

3. Frontend Setup
cd frontend
npm install
npm run dev

⸻

4. Environment Variables

Create .env file in backend:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

⸻

🔐 Security Features
	•	JWT Authentication
	•	Role-based access (Admin / Farmer / Mill Owner)
	•	Protected API routes
	•	Maintenance mode middleware
	•	File upload handling with Multer

⸻

🚀 Real-Time Features
	•	Live notifications
	•	Instant dispute updates
	•	Admin broadcast system
	•	Socket-based user communication

⸻

📌 Future Improvements
	•	Payment gateway integration
	•	Advanced analytics dashboard
	•	Mobile app version
	•	AI-based price prediction
	•	Notification preferences

⸻

👨‍💻 Author

Eranda Buddhika

⸻

📜 License

This project is developed for academic and demonstration purposes.