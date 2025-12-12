import { Spinner } from "@/components/ui/spinner";
import { type User, getUser } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSession() {
            try {
                const res = await getUser();
                setUser(res.user);
            } catch (error: any) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="size-12" />
            </div>
        )
    }
    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}