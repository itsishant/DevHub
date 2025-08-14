import { WebSocketServer, WebSocket } from "ws";
import http from "http";

interface User {
  userId: string;
  socket: WebSocket;
}

let allSockets: User[] = [];

export const createWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    socket.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "connect" && parsedMessage.userId) {
          allSockets = allSockets.filter(u => u.userId !== parsedMessage.userId);
          allSockets.push({ userId: parsedMessage.userId, socket });
        }

        if (parsedMessage.type === "chat" && parsedMessage.payload?.receiverId && parsedMessage.payload.message) {
          const receiver = allSockets.find(u => u.userId === parsedMessage.payload.receiverId);
          if (receiver && receiver.socket.readyState === WebSocket.OPEN) {
            receiver.socket.send(JSON.stringify(parsedMessage.payload.message));
          }
        }
      } catch (error) {
        console.error("Failed to process message:", error);
      }
    });

    socket.on("close", () => {
      allSockets = allSockets.filter((u) => u.socket !== socket);
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
      allSockets = allSockets.filter((u) => u.socket !== socket);
    });
  });

  return wss;
};