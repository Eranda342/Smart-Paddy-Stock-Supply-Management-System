import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/api";

// Read token at module init time (user is logged-in when this runs).
// If null, the backend allows the connection but restricts private rooms.
const token = localStorage.getItem("token");

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  auth: {
    token, // sent in socket.handshake.auth.token on the backend
  },
});

// ── Central error listener (registered once, not in every component) ──
socket.on("socket_error", (msg) => {
  console.warn("⚠️ Socket error:", msg);
});

// ── Factory: creates a fresh socket with the current token ──
// Use this after login so the handshake carries the new token.
// The caller is responsible for disconnecting the old singleton if needed.
export const createSocket = () => {
  const freshToken = localStorage.getItem("token");
  return io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    auth: { token: freshToken },
  });
};

