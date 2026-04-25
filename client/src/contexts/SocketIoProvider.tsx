import React, { useState, useEffect } from 'react';
import { io, Socket } from "socket.io-client";

interface SocketIoContextType {
    socket: Socket | undefined;
    isConnected: boolean;
    connectSocket: () => void;
    disconnectSocket: () => void;
}

const SocketIoContext = React.createContext<SocketIoContextType | null>(null);

export default function SocketIoProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | undefined>();
    const [isConnected, setIsConnected] = useState(false);

    function connectSocket() {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
        const socketInstance = io(baseUrl, {
            withCredentials: true,
        });
        setSocket(socketInstance);
    }

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, [socket]);

    function disconnectSocket() {
        if (socket) {
            socket.disconnect();
        }
        setSocket(undefined);
        setIsConnected(false);
    }

    return (
        <SocketIoContext.Provider value={{ socket, isConnected, connectSocket, disconnectSocket }}>
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