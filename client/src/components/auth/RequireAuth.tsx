import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Spinner } from "@/components/ui/spinner";


export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="size-12" />
            </div>
        )
    }
    if (!user) {
        return <Navigate to="/signin" replace />;
    }
    return <>{children}</>;
}