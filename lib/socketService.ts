import { Server as NetServer } from 'http';
import { NextApiRequest, NextRequest } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

// Flag to disable socket initialization if we detect issues
// This can be set to true if repeated errors occur
const DISABLE_SOCKET_SERVER = process.env.DISABLE_SOCKET_SERVER === 'true';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// For App Router
export type ResponseWithSocket = any & {
  socket?: {
    server?: NetServer & {
      io?: SocketIOServer;
    };
  };
};

// Event names
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

// This code only runs on the server
let io: SocketIOServer;

// Track initialization failures to prevent repeated attempts
let initFailCount = 0;
const MAX_INIT_FAILURES = 3;

// Generic function that works with both Next.js Pages Router and App Router
export function initSocketServer(req: NextApiRequest | NextRequest, res: NextApiResponseWithSocket | ResponseWithSocket) {
  // If sockets are disabled, don't even try to initialize
  if (DISABLE_SOCKET_SERVER) {
    console.log('Socket server initialization disabled by configuration');
    return null;
  }
  
  // If we've had too many initialization failures, disable for this session
  if (initFailCount >= MAX_INIT_FAILURES) {
    console.log(`Socket server disabled after ${initFailCount} failed initialization attempts`);
    return null;
  }
  
  try {
    // Check if socket is available (App Router might not have it)
    if (!res.socket || !res.socket.server) {
      console.log('Socket server cannot be initialized: res.socket or res.socket.server is undefined');
      initFailCount++;
      return null;
    }
    
    // Socket.io server is already initialized
    if (res.socket.server.io) {
      console.log('Socket server already running');
      io = res.socket.server.io;
      return io;
    }
    
    console.log('Initializing Socket.io server...');
    
    // Create a new Socket.io instance
    const ioServer = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
    
    // Assign to server object and global variable
    res.socket.server.io = ioServer;
    io = ioServer;
    
    // Socket connection handler
    io.on(SOCKET_EVENTS.CONNECT, (socket) => {
      console.log('New client connected', socket.id);
      
      // Handle recruiters joining their room
      socket.on(SOCKET_EVENTS.JOIN_RECRUITER_ROOM, (recruiterId: string) => {
        const roomName = `recruiter_${recruiterId}`;
        socket.join(roomName);
        console.log(`Recruiter ${recruiterId} joined room ${roomName}`);
      });
      
      // Handle students joining their room
      socket.on(SOCKET_EVENTS.JOIN_STUDENT_ROOM, (studentId: string) => {
        const roomName = `student_${studentId}`;
        socket.join(roomName);
        console.log(`Student ${studentId} joined room ${roomName}`);
      });
      
      // Handle disconnection
      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log('Client disconnected', socket.id);
      });
    });
    
    // Reset failure counter on successful initialization
    initFailCount = 0;
    
    return io;
  } catch (error) {
    console.error('Error initializing socket.io server:', error);
    initFailCount++;
    return null;
  }
}

// Function to emit candidate updates to recruiters
export function emitCandidateUpdate(candidateData: any) {
  if (!io) {
    console.warn('Socket.io server not initialized, cannot emit candidate update');
    return;
  }
  
  try {
    console.log('Emitting candidate update:', candidateData.id);
    
    // Emit to all connected recruiters
    io.emit(SOCKET_EVENTS.CANDIDATES_UPDATED, {
      candidate: candidateData,
      timestamp: Date.now()
    });
    
    // If we have job info, emit to the specific job's recruiter room
    if (candidateData.jobId && candidateData.recruiterId) {
      const roomName = `recruiter_${candidateData.recruiterId}`;
      io.to(roomName).emit(SOCKET_EVENTS.NEW_APPLICATION, {
        candidate: candidateData,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Error emitting socket event:', error);
  }
}

// Get the Socket.io instance (if already initialized)
export function getSocketInstance() {
  return io;
} 