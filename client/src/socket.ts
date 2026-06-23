import { io } from 'socket.io-client';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://typerace-backend-production-29b6.up.railway.app';
const socket = io(BACKEND);
export default socket;
