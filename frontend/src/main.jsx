import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import "./styles/index.css";

// Monkey-patch fetch to globally catch 503 Maintenance Mode from API
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  // If backend returns 503 via the Maintenance Middleware guard
  if (response.status === 503 && window.location.pathname !== '/maintenance') {
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.maintenanceMode) {
        window.location.href = '/maintenance';
      }
    } catch (e) {
      // Ignored
    }
  }
  return response;
};

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);