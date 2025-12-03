import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      // ✅ Clean URL (prevents / at end + localhost errors)
      const rawUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const SOCKET_URL = rawUrl.replace(/\/$/, '');

      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      newSocket.emit('join_with_data', { 
        userId: user._id, 
        username: user.username 
      });

      newSocket.on('user_status_change', ({ userId, status }) => {
        console.log(`User ${userId} is ${status}`);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

