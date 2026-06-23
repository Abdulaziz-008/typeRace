import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const socket = io(BACKEND);
export default socket;
