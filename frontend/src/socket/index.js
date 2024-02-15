// ES6 import or TypeScript
import { io } from "socket.io-client";

export const getSocketGlobal = (employee_id) => {
  return io(import.meta.env.VITE_SOCKET_BASE_URL, {
    transports: ["polling"],
    path: "/global",
    query: { employee_id },
  });
};

export const getSocketRoom = (roomId, employee_id) => {
  return io(import.meta.env.VITE_SOCKET_BASE_URL, {
    transports: ["polling"],
    path: "/chat",
    query: { roomId },
  });
};
