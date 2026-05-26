import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@radix-ui/react-label";
import { Camera, CameraOff, EllipsisVertical, Mic, MicOff, VideoOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Cam() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>("");
    const [selectedMicId, setSelectedMicId] = useState<string>("");
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [deviceError, setDeviceError] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    async function getMedia(data?: { cameraId?: string, micId?: string }) {
        const { cameraId, micId } = data || {};
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({ video: cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "user" }, audio: micId ? { deviceId: { exact: micId } } : true });
            setStream(newStream);
            return newStream;
        } catch (error: any) {
            setDeviceError(true);
        } return null;
    }
    async function getDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            setCameras(cameras);
            const mics = devices.filter((device) => device.kind === "audioinput");
            setMics(mics);
        } catch (error: any) {
            setDeviceError(true);
        }
    }    

    useEffect(() => {
        getMedia().then((stream) => {
            setSelectedCameraId(stream?.getVideoTracks()[0].getSettings().deviceId || "")
            setSelectedMicId(stream?.getAudioTracks()[0].getSettings().deviceId || "")
        });
        getDevices();
    }, []);

    useEffect(() => {
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [stream]);

    useEffect(() => {
        if (selectedCameraId) {
            stream?.getTracks().forEach(track => track.stop());
            getMedia({ cameraId: selectedCameraId, micId: selectedMicId });
        }
    }, [selectedCameraId])
    useEffect(() => {
        if (selectedMicId) {
            stream?.getTracks().forEach(track => track.stop());
            getMedia({ micId: selectedMicId, cameraId: selectedCameraId });
        }
    }, [selectedMicId])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (isCameraEnabled) {
            stream?.getVideoTracks().forEach(track => track.enabled = true);
        } else {
            stream?.getVideoTracks().forEach(track => track.enabled = false);
        }
    }, [isCameraEnabled, stream])
    useEffect(() => {
        if (isMicEnabled) {
            stream?.getAudioTracks().forEach(track => track.enabled = true);
        } else {
            stream?.getAudioTracks().forEach(track => track.enabled = false);
        }
    }, [isMicEnabled, stream])
    return (
        <div className={`w-[800px] aspect-video bg-popover relative group`}>
            {deviceError ? <Label className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">장비를 찾을 수 없습니다. 다시 시도해주세요.</Label> : <>
                {isCameraEnabled || <VideoOff className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-16 text-muted-foreground" />}
                <div className={`w-full h-full ${isCameraEnabled ? "" : "hidden"}`}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>

                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-0">
                    <Button className={`cursor-pointer rounded-l-full size-12 ${isCameraEnabled ? "bg-accent hover:bg-card" : "bg-destructive hover:bg-destructive"}`} onClick={() => setIsCameraEnabled(!isCameraEnabled)}>
                        {isCameraEnabled ? <Camera className="text-foreground size-6" /> : <CameraOff className="text-foreground size-6" />}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="rounded-r-full cursor-pointer h-12 w-10 bg-accent hover:bg-card mr-8">
                                <EllipsisVertical className="size-6 text-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-max-80">
                            <DropdownMenuLabel>카메라 변경</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={selectedCameraId} onValueChange={setSelectedCameraId}>
                                {cameras.map((camera) => (
                                    <DropdownMenuRadioItem key={camera.deviceId} value={camera.deviceId}>
                                        {camera.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className={`rounded-l-full cursor-pointer size-12 ${isMicEnabled ? "bg-accent hover:bg-card" : "bg-destructive hover:bg-destructive"}`} onClick={() => setIsMicEnabled(!isMicEnabled)}>
                        {isMicEnabled ? <Mic className="text-foreground size-6" /> : <MicOff className="text-foreground size-6" />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="rounded-r-full cursor-pointer h-12 w-10 bg-accent hover:bg-card">
                                <EllipsisVertical className="size-6 text-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-max-80">
                            <DropdownMenuLabel>
                                마이크 변경
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={selectedMicId} onValueChange={setSelectedMicId}>
                                {mics.map((mic) => (
                                    <DropdownMenuRadioItem key={mic.deviceId} value={mic.deviceId}>
                                        {mic.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </>}
        </div>
    );
}