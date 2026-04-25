import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarProvider, useSidebar, SidebarInset } from "@/components/ui/sidebar";
import { useNote } from "@/contexts/NoteProvider";
import type { OpenedNote } from "@/lib/api";
import { noteThemes } from "@/lib/noteThemes";
import { ChevronRight, ChevronsLeft, ChevronsRight, Folder } from "lucide-react";

interface Props {
    openedNotes: OpenedNote[];
    switchNote: (noteId: string) => void;
    children: React.ReactNode;
}

function CustomTrigger() {
    const { toggleSidebar, state } = useSidebar(); // state: "expanded" | "collapsed"
    return (
        <button
            onClick={toggleSidebar}
            className="z-50 bg-accent/0 p-2 h-[calc(100vh-4rem)] w-1 -translate-x-2 rounded-r-md group hover:bg-accent transition-colors"
        >
            {state === "expanded" ? <ChevronsLeft className="bg-accent/50 text-accent-foreground/50 size-8 rounded-r-full -translate-x-2 group-hover:bg-accent group-hover:text-accent-foreground transition-colors" /> : <ChevronsRight className="bg-accent/50 text-accent-foreground/50 size-8 rounded-r-full -translate-x-2 group-hover:bg-accent group-hover:text-accent-foreground transition-colors" />}
        </button>
    )
}

export default function NoteSidebar({ openedNotes, switchNote, children }: Props) {
    const { notes } = useNote();

    const noteTags = [...new Set(notes.map((note) => note.tag))];

    return (
        <SidebarProvider style={{ minHeight: "calc(100vh - 4rem)", height: "calc(100vh - 4rem)" }} className="overflow-hidden">
            <Sidebar>
                <SidebarHeader />
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>내 노트</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {noteTags.map((tag) => (
                                    <Collapsible key={tag || "미분류"} asChild className="group/collapsible">
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="group/label">
                                                    <Folder className="size-4 mr-2 text-muted-foreground transition-colors group-hover/label:text-foreground" />
                                                    <Label className="truncate cursor-pointer font-medium">
                                                        {tag || "미분류"}
                                                    </Label>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <span className="text-xs text-muted-foreground/80 px-1.5 py-0.5 rounded-md bg-accent/50 group-hover/label:bg-accent transition-colors">
                                                            {notes.filter((note) => note.tag === tag).length}
                                                        </span>
                                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-hover/label:text-foreground" />
                                                    </div>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub className="mr-0 pr-0">
                                                    {notes.filter((note) => note.tag === tag).map((note) => (
                                                        <SidebarMenuItem key={note._id}>
                                                            <SidebarMenuButton className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
                                                                onClick={() => switchNote(note._id)}
                                                                style={{ backgroundColor: openedNotes.find((openedNote) => openedNote.noteId === note._id) ? "var(--muted)" : "transparent" }}
                                                            >
                                                                <div
                                                                    className="size-2 rounded-full shrink-0 shadow-sm"
                                                                    style={{ backgroundColor: noteThemes.find((theme) => theme.name === note.theme)?.color || "var(--muted)" }}
                                                                />
                                                                <span className="truncate text-sm">
                                                                    {note.title}
                                                                </span>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup />
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>
            <SidebarInset className="relative overflow-hidden ">
                <div className="absolute z-50">
                    <CustomTrigger />
                </div>
                {children}
            </SidebarInset>
        </SidebarProvider >
    );
}