import Cam from "@/components/features/study/Cam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useSocketIo } from "@/contexts/SocketIoProvider";

export default function StudyPage() {
    const [message, setMessage] = useState("");
    const { socket } = useSocketIo();

    function makeConnection() {
        const peerConnection = new RTCPeerConnection();
    }

    return (
        <div>
            <div className={`flex items-center justify-center`}>
                <Cam />
                <Input value={message} placeholder="들어갈 방 이름 입력" onChange={(e) => setMessage(e.target.value)} />
                <Button onClick={() => socket?.emit("join", message, () => {
                    setMessage("방에 입장을 완료했습니다.");
                })}>방 들어가기</Button>
            </div>
        </div>
    );
}