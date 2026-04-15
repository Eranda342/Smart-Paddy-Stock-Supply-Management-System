import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import "./styles/index.css";

// Monkey-patch fetch to globally catch 503 Maintenance Mode + 403 Suspended
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);

  // 503 → Maintenance Mode
  if (response.status === 503 && window.location.pathname !== '/maintenance') {
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.maintenanceMode) {
        window.location.href = '/maintenance';
      }
    } catch (e) {}
  }

  // 403 → Account Suspended (backend sets this when isBlocked is true)
  if (response.status === 403) {
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.message && data.message.toLowerCase().includes('suspended')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?suspended=true';
      }
    } catch (e) {}
  }

  return response;
};


createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);