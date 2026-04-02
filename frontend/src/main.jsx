import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./app/App.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);