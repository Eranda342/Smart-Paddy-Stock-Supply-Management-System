🌾 AgroBridge

Smart Paddy Stock Supply Management System

AgroBridge is a full-stack digital platform designed to connect farmers and mill owners in Sri Lanka’s paddy supply chain. It enables seamless trading, negotiation, and transport coordination — all in one place.

⸻

🚀 Features

👨‍🌾 Farmer Features
	•	Create and manage paddy listings
	•	View and respond to buy requests
	•	Negotiate prices in real-time
	•	Track transactions and history

🏭 Mill Owner Features
	•	Post buy requests
	•	Browse available farmer listings
	•	Negotiate directly with farmers
	•	Manage purchases and logistics

🚚 Transport Module
	•	Assign drivers for pickups
	•	Track transport status
	•	(Mock) SMS notifications for delivery updates

📊 Analytics & Reports
	•	Export reports (PDF / Excel)
	•	Custom date range filtering
	•	Dashboard insights

🔐 Authentication & Verification
	•	Email verification system
	•	Role-based access (Farmer / Mill Owner / Admin)
	•	Business verification workflow

⸻

🛠️ Tech Stack

Frontend
	•	React.js
	•	Tailwind CSS
	•	Vite

Backend
	•	Node.js
	•	Express.js

Database
	•	MongoDB

Other Tools
	•	jsPDF (PDF generation)
	•	Excel export utilities
	•	Nodemailer (Email system)

⸻

🎨 UI Highlights
	•	Modern dark-themed SaaS UI
	•	Glassmorphism effects
	•	Responsive design
	•	Interactive dashboards

⸻

📂 Project Structure

frontend/
  src/
    assets/
    components/
    pages/

backend/
  controllers/
  routes/
  models/


⸻

⚙️ Installation & Setup

1️⃣ Clone the repository

git clone https://github.com/your-username/agrobridge.git
cd agrobridge

2️⃣ Install dependencies

Frontend:

cd frontend
npm install
npm run dev

Backend:

cd backend
npm install
npm run server


⸻

🌐 Environment Variables

Create a .env file in backend:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password


⸻

📸 Screenshots
	•	Landing Page
	•	Dashboard
	•	Paddy Listings
	•	Negotiation System

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./frontend/public/screenshots/landing.png)

---

### 👨‍🌾 Farmer Dashboard
![Farmer Dashboard](./frontend/public/screenshots/farmer-dashboard.png)

---

### 🏭 Mill Owner Dashboard
![Mill Owner Dashboard](./frontend/public/screenshots/mill-owner-dashboard.png)

---

### 🛠️ Admin Dashboard
![Admin Dashboard](./frontend/public/screenshots/admin-dashboard.png)

---

### 🌾 Paddy Types
![Paddy Types](./frontend/public/screenshots/paddy-types.png)

---

### 💬 Negotiations
![Negotiations](./frontend/public/screenshots/negotiations.png)

⸻

📈 Future Improvements
	•	Real SMS integration (Twilio)
	•	Payment gateway integration
	•	AI-based price recommendations
	•	Mobile app version

⸻

👨‍💻 Author

Eranda Buddhika
Undergraduate Computer Science Student

⸻

📜 License

This project is developed for academic purposes and demonstration.

⸻

⭐ Acknowledgements

Inspired by real-world agricultural supply chain challenges in Sri Lanka.