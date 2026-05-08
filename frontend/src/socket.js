import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/api";

let socketInstance = null;

export const getSocket = () => socketInstance;

export const connectSocket = (token) => {
  if (!token) {
    console.warn("⚠️ No token provided, skipping socket connection");
    return;
  }
  if (socketInstance) {
    socketInstance.auth = { token };
    socketInstance.disconnect().connect();
    return socketInstance;
  }
  socketInstance = io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    auth: { token }
  });
  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });
  socketInstance.on("socket_error", (msg) => {
    console.warn("⚠️ Socket error:", msg);
  });
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// Export a proxy so existing imports (import { socket }) don't break
export const socket = new Proxy({}, {
  get: (target, prop) => {
    if (!socketInstance) {
      return () => {};
    }
    const value = socketInstance[prop];
    return typeof value === "function" ? value.bind(socketInstance) : value;
  }
});

