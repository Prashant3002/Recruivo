import { Socket, io as socketIOClient } from "socket.io-client";

// Event names - keep in sync with server side
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_APPLICATION: 'new_application',
  APPLICATION_UPDATED: 'application_updated',
  CONNECTION_ERROR: 'connect_error',
  JOIN_RECRUITER_ROOM: 'join_recruiter_room',
  JOIN_STUDENT_ROOM: 'join_student_room',
  CANDIDATES_UPDATED: 'candidates_updated'
};

// Initialize socket connection
export function initSocketClient(): Socket {
  const socket = socketIOClient({
    path: '/api/socket',
    addTrailingSlash: false,
  });
  
  // Setup default handlers
  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('Socket connected successfully', socket.id);
  });
  
  socket.on(SOCKET_EVENTS.CONNECTION_ERROR, (err) => {
    console.error('Socket connection error:', err);
  });
  
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('Socket disconnected');
  });
  
  return socket;
} 