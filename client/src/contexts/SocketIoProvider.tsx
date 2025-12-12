import React, { useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";

interface SocketIoContextType {
    socket: Socket | undefined;
    isConnected: boolean;
}

const SocketIoContext = React.createContext<SocketIoContextType | null>(null);

export default function SocketIoProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | undefined>();
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        setIsConnected(false);
        // process.env.NODE_ENV === "production" ? "" : "http://localhost:3002"; // Vite Proxy를 사용하기 위해 제거
        const socketInstance = io("/", {
            withCredentials: true,
        });
        setSocket(socketInstance);

        socketInstance.on("connect", () => {
            setIsConnected(true);
        });
        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });
        return () => {
            socketInstance.disconnect();
        }
    }, []);

    return (
        <SocketIoContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketIoContext.Provider>
    );
}

export function useSocketIo() {
    const context = React.useContext(SocketIoContext);
    if (!context) {
        throw new Error("useSocketIo must be used within a SocketIoProvider");
    }
    return context;
}