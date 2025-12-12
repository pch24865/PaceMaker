import { getNotes, type Note } from "@/lib/api";
import React, { useEffect, useState, useContext } from "react";
import { toast } from "sonner";

interface NoteContextType {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    loading: boolean;
}

const NoteContext = React.createContext<NoteContextType | null>(null);

export function NoteProvider({ children }: { children: React.ReactNode }) {

    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        async function fetchNotes() {
            try {
                const res = await getNotes();
                const fetchedNotes = res.notes.map((note) => ({
                    ...note,
                    _id: note._id,
                }));
                setNotes(fetchedNotes);
            } catch (error: any) {
                if (error.response) {
                    toast(error.response.data.message);
                } else {
                    toast("노트 조회중 오류가 발생하였습니다.")
                }
            } finally {
                setLoading(false);
            }
        }
        fetchNotes();
    }, []);

    return (
        <NoteContext.Provider value={{ notes, setNotes, loading }}>
            {children}
        </NoteContext.Provider>
    );
}

export function useNote() {
    const context = useContext(NoteContext);
    if (!context) {
        throw new Error("useNote must be used within a NoteProvider");
    }
    return context;
}
