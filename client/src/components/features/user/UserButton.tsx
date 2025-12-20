import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthProvider";
import { useSocketIo } from "@/contexts/SocketIoProvider";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";
import { signout } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export default function NavUserButton() {
    const { user, loading, setUser } = useAuth();
    const { disconnectSocket } = useSocketIo();

    const handleSignout = async () => {
        try {
            await signout();
            disconnectSocket();
            setUser(null);
            window.location.reload();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    // Todo 로그인 로직 구현 후 디자인 수정.
    if (loading) {
        return (
            <div>
                <Skeleton className="size-10 rounded-full bg-accent" />
            </div>
        )
    }
    if (user) {
        return (
            <div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full bg-accent size-10 p-0 overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary hover:bg-popover duration-200">
                            <UserIcon className="size-6 text-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>{user.name}님 환영합니다.</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignout} className="text-destructive focus:bg-destructive/50 cursor-pointer">
                            로그아웃
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }

    return (
        <div>
            <Button>
                <Link to="/signin">
                    로그인
                </Link>
            </Button>
        </div>
    )
}