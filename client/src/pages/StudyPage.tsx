import Cam from "@/components/features/study/Cam";
import { useEffect } from "react";
import { useSocketIo } from "@/contexts/SocketIoProvider";

export default function StudyPage() {
    const { connectSocket, socket, isConnected } = useSocketIo();
    useEffect(() => {
        if (!socket || socket.disconnected) {
            connectSocket();
        }
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on("hi", () => {
                console.log("hi");
            });
        }
        return () => {
            socket?.off("hi");
        }
    }, [socket])

    return (
        <div>
            <div className={`flex items-center justify-center`}>
                <Cam />
            </div>
            {isConnected ? "연결됨" : "연결안됨"}
        </div>
    );
}