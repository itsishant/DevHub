// src/socket.js
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

// We create the socket instance but don't connect immediately.
// We'll connect manually once we have the user's auth token.
export const socket = io(SERVER_URL, {
  autoConnect: false,
});