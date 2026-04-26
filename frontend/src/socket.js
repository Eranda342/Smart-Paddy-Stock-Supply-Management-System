import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/api";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
});
