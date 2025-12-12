import NoteWindow from "@/components/features/note/NoteWindow";
import { createNote, deleteNote, getNoteLayout, saveNoteLayout, type Note as ApiNote, type OpenedNote } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import z from "zod";
import { toast } from "sonner";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { noteThemes } from "@/lib/noteThemes";
import { useNote } from "@/contexts/NoteProvider";
import NoteSidebar from "@/components/features/note/NoteSidebar";


export default function NotePage() {
    // const [notes, setNotes] = useState<Note[]>([]);
    const [openedNotes, setOpenedNotes] = useState<OpenedNote[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [createNoteTitleError, setCreateNoteTitleError] = useState(false);
    const [createNoteErrorMessage, setCreateNoteErrorMessage] = useState("");
    const [createNoteTitle, setCreateNoteTitle] = useState("");
    const [createNoteTheme, setCreateNoteTheme] = useState<string>("");
    const [createNoteTag, setCreateNoteTag] = useState<string>("");
    const bounds = useRef<HTMLDivElement>(null);

    const { notes, setNotes, loading } = useNote();
    // 노트 조회 api
    useEffect(() => {
        async function fetchWorkspace() {
            const res = await getNoteLayout();
            if (!bounds.current) return;
            const parentWidth = bounds.current.offsetWidth;
            const parentHeight = bounds.current.offsetHeight;

            const fetchedWorkspace = res.noteWorkspace.openedNotes.map((note) => ({
                ...note,
                noteId: note.noteId,
                x: note.xRate * parentWidth,
                y: note.yRate * parentHeight,
                width: note.widthRate * parentWidth,
                height: note.heightRate * parentHeight,
                xRate: note.xRate,
                yRate: note.yRate,
                widthRate: note.widthRate,
                heightRate: note.heightRate,
                zIndex: note.zIndex,
                fullScreen: note.fullScreen,
            }));
            setOpenedNotes(fetchedWorkspace);
        }
        fetchWorkspace();
    }, [])

    // 화면 크기 조정 및 사이드바 토글 감지 (ResizeObserver)
    useEffect(() => {
        if (!bounds.current) return;

        const resizeObserver = new ResizeObserver(() => {
            if (!bounds.current) return;
            const parentWidth = bounds.current.offsetWidth;
            const parentHeight = bounds.current.offsetHeight;

            setOpenedNotes(prev => prev.map(openedNote => {
                // 비율에 맞게 설정
                const newX = parentWidth * openedNote.xRate;
                const newY = parentHeight * openedNote.yRate;
                const newWidth = parentWidth * openedNote.widthRate;
                const newHeight = parentHeight * openedNote.heightRate;

                // 값이 다를 때만 업데이트 (불필요한 렌더링 방지)
                if (Math.abs(newX - openedNote.x) > 1 || Math.abs(newY - openedNote.y) > 1 || Math.abs(newWidth - openedNote.width) > 1 || Math.abs(newHeight - openedNote.height) > 1) {
                    return { ...openedNote, x: newX, y: newY, width: newWidth, height: newHeight };
                }
                return openedNote;
            }));
        });

        resizeObserver.observe(bounds.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // [Helper] 노트 zIndex 재정렬 (순수한 계산 로직)
    const getReorderedNotes = (currentNotes: OpenedNote[], activeId: string) => {
        const sortedIds = [...currentNotes].sort((a, b) => a.zIndex - b.zIndex).map(n => n.noteId);
        const newSortedIds = sortedIds.filter(noteId => noteId !== activeId);
        newSortedIds.push(activeId);
        return currentNotes.map(n => ({
            ...n,
            zIndex: newSortedIds.indexOf(n.noteId) + 1
        }));
    };

    // 노트 Focus 관리
    const bringToFront = (id: string) => {
        const nextNotes = getReorderedNotes(openedNotes, id);
        // 변경사항이 없으면 업데이트 안 함 (무한 루프 방지)
        if (JSON.stringify(nextNotes) === JSON.stringify(openedNotes)) return;

        setOpenedNotes(nextNotes);
        saveNoteLayoutHandler(nextNotes);
    };

    // 노트 위치 업데이트
    const updateNotePosition = (id: string, x: number, y: number) => {
        if (!bounds.current) return;
        const parentWidth = bounds.current.offsetWidth;
        const parentHeight = bounds.current.offsetHeight;
        const xRate = x / parentWidth;
        const yRate = y / parentHeight;

        // 1. 위치 업데이트 계산
        let nextNotes = openedNotes.map(openedNote =>
            openedNote.noteId === id ? { ...openedNote, x, y, xRate, yRate } : openedNote
        );
        // 2. zIndex 업데이트 계산 (드래그 시 맨 위로)
        nextNotes = getReorderedNotes(nextNotes, id);
        // 3. 상태 적용 및 저장
        setOpenedNotes(nextNotes);
        saveNoteLayoutHandler(nextNotes);
    };

    // 노트 크기 업데이트
    const updateNoteSize = (id: string, width: number, height: number, x: number, y: number) => {
        if (!bounds.current) return;
        const parentWidth = bounds.current.offsetWidth;
        const parentHeight = bounds.current.offsetHeight;
        const widthRate = width / parentWidth;
        const heightRate = height / parentHeight;
        const xRate = x / parentWidth;
        const yRate = y / parentHeight;

        // 1. 크기/위치 업데이트 계산
        let nextNotes = openedNotes.map(openedNote =>
            openedNote.noteId === id ? { ...openedNote, width, height, x, y, widthRate, heightRate, xRate, yRate, fullScreen: false } : openedNote
        );
        // 2. zIndex 업데이트 계산
        nextNotes = getReorderedNotes(nextNotes, id);
        // 3. 상태 적용 및 저장
        setOpenedNotes(nextNotes);
        saveNoteLayoutHandler(nextNotes);
    };

    // 노트 레이아웃 저장
    const saveNoteLayoutHandler = async (openedNotes: OpenedNote[]) => {
        const data = openedNotes.map(openedNote => ({
            noteId: openedNote.noteId,
            xRate: openedNote.xRate,
            yRate: openedNote.yRate,
            widthRate: openedNote.widthRate,
            heightRate: openedNote.heightRate,
            zIndex: openedNote.zIndex,
            fullScreen: openedNote.fullScreen
        }));
        try {
            await saveNoteLayout({ openedNotes: data });
        } catch (error: any) {
            if (error.response) {
                toast(error.response.data.message);
            } else {
                toast("오류가 발생했습니다.");
            }
        }
    };

    // 노트 삭제
    const deleteNoteHandler = async (id: string) => {
        try {
            await deleteNote({ id });
            setOpenedNotes(prev => prev.filter(openedNote => openedNote.noteId !== id));
            setNotes(prev => prev.filter(note => note._id !== id));
            toast("노트가 삭제되었습니다.");
        } catch (error: any) {
            if (error.response) {
                toast(error.response.data.message);
            } else {
                toast("오류가 발생했습니다.");
            }
        }
    };

    // 노트 내용 업데이트
    const updateNoteContent = ({ id, title, theme, tag, contents }: { id: string, title: string, theme: string, tag: string, contents: Array<any> }) => {
        setNotes(prev => prev.map(note => note._id === id ? { ...note, title, theme, tag, contents } : note));
    };

    // 노트 생성
    const createNoteHandler = async (title: string, theme: string, tag: string) => {
        const noteTitleSchma = z.string().min(1, "노트 제목을 입력해주세요.");
        const result = noteTitleSchma.safeParse(title);
        if (!result.success) {
            setCreateNoteTitleError(true);
            setCreateNoteErrorMessage(result.error.issues[0].message);
            return;
        } else {
            setCreateNoteTag("");
            // 노트 생성
            try {
                const res = await createNote({ title, theme, tag });
                const newNote = { ...res.note, id: res.note._id };
                setIsPopoverOpen(false);
                setCreateNoteTitle("");
                setNotes(prev => [...prev, newNote]);

                // 레이아웃 저장
                try {
                    if (openedNotes.length >= 10) {
                        toast("노트는 최대 10개까지 열 수 있습니다.", {
                            description: "열린 노트를 닫고 생성된 노트를 열어주세요."
                        });
                        return;
                    }
                    if (!bounds.current) return;
                    const parentWidth = bounds.current.offsetWidth;
                    const parentHeight = bounds.current.offsetHeight;

                    // 가장 높은 zIndex 계산
                    const maxZIndex = openedNotes.length > 0
                        ? Math.max(...openedNotes.map(n => n.zIndex))
                        : 0;
                    const newOpenedNote = {
                        noteId: newNote.id,
                        xRate: 0.2,
                        yRate: 0.2,
                        widthRate: 0.5,
                        heightRate: 0.5,
                        zIndex: maxZIndex + 1, // 맨 위에 배치
                        x: parentWidth * 0.2,
                        y: parentHeight * 0.2,
                        width: parentWidth * 0.5,
                        height: parentHeight * 0.5,
                        fullScreen: false,
                    };
                    // 새 리스트 생성 (기존 목록 + 새 노트)
                    const newOpenedNotesList = [...openedNotes, newOpenedNote];
                    // 상태 업데이트 & 저장
                    setOpenedNotes(newOpenedNotesList);
                    saveNoteLayoutHandler(newOpenedNotesList);

                } catch (error: any) {
                    if (error.response) {
                        toast(error.response.data.message);
                    } else {
                        toast("레이아웃 저장 중 오류가 발생했습니다. 노트를 직접 열어주세요.");
                    }
                }
            } catch (error: any) {
                if (error.response) {
                    setCreateNoteTitleError(true);
                    setCreateNoteErrorMessage(error.response.data.message);
                } else {
                    setCreateNoteTitleError(true);
                    setCreateNoteErrorMessage("노트 생성 중 오류가 발생했습니다.");
                }
            }
        }
    }
    // FullScreen Toggle
    const switchFullScreen = (id: string) => {
        const newLayout = openedNotes.map(openedNote => openedNote.noteId === id ? { ...openedNote, fullScreen: !openedNote.fullScreen } : openedNote);
        setOpenedNotes(newLayout);
        saveNoteLayoutHandler(newLayout);
    }
    // Close Note
    const closeNote = (id: string) => {
        const newLayout = openedNotes.filter(openedNote => openedNote.noteId !== id);
        setOpenedNotes(newLayout);
        saveNoteLayoutHandler(newLayout);
    }

    // Open Note
    const openNote = (id: string) => {
        if (openedNotes.length >= 10) {
            toast("노트는 최대 10개까지 열 수 있습니다.");
            return;
        }
        const parentWidth = bounds.current?.offsetWidth || 0;
        const parentHeight = bounds.current?.offsetHeight || 0;
        const randomX = (Math.floor(Math.random() * 4) + 1) / 10;
        const randomY = (Math.floor(Math.random() * 4) + 1) / 10;
        const newLayout = [...openedNotes, { noteId: id, xRate: randomX, yRate: randomY, widthRate: 0.5, heightRate: 0.5, zIndex: openedNotes.length + 1, x: parentWidth * randomX, y: parentHeight * randomY, width: parentWidth * 0.5, height: parentHeight * 0.5, fullScreen: false }];
        setOpenedNotes(newLayout);
        saveNoteLayoutHandler(newLayout);
    }

    // Switch Note OpenState
    const switchNote = (id: string) => {
        if (openedNotes.find(openedNote => openedNote.noteId === id)) {
            closeNote(id);
        } else {
            openNote(id);
        }
    }

    // 노트 커스텀 사이즈 및 정렬
    const arrayNoteSizeAndPosition = (noteId: string, xRate: number, yRate: number, widthRate: number, heightRate: number) => {
        const parentWidth = bounds.current?.offsetWidth || 0;
        const parentHeight = bounds.current?.offsetHeight || 0;
        const newLayout = openedNotes.map(openedNote => openedNote.noteId === noteId ? { ...openedNote, xRate, yRate, widthRate, heightRate, x: parentWidth * xRate, y: parentHeight * yRate, width: parentWidth * widthRate, height: parentHeight * heightRate, fullScreen: false } : openedNote);
        setOpenedNotes(newLayout);
        saveNoteLayoutHandler(newLayout);
    }

    return (
        <NoteSidebar openedNotes={openedNotes} switchNote={switchNote}>
            <div ref={bounds} className="bounds relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
                {openedNotes.map(openedNote => {
                    const noteData = notes.find(n => n._id === openedNote.noteId);
                    if (!noteData) return null;
                    const { title, theme, tag, contents } = noteData;

                    return (
                        <NoteWindow
                            key={openedNote.noteId}
                            id={openedNote.noteId}
                            title={title}
                            tag={tag}
                            theme={theme}
                            contents={contents}
                            isFullScreen={openedNote.fullScreen}
                            x={openedNote.fullScreen ? 0 : openedNote.x}
                            y={openedNote.fullScreen ? 0 : openedNote.y}
                            width={openedNote.fullScreen ? bounds.current?.offsetWidth || openedNote.width : openedNote.width}
                            height={openedNote.fullScreen ? bounds.current?.offsetHeight || openedNote.height : openedNote.height}
                            zIndex={openedNote.zIndex}
                            onDragStop={updateNotePosition}
                            onResizeStop={updateNoteSize}
                            onContentChange={updateNoteContent}
                            onFocus={() => bringToFront(openedNote.noteId)}
                            switchFullScreen={switchFullScreen}
                            onClose={closeNote}
                            onDelete={deleteNoteHandler}
                            arrayNoteSizeAndPosition={arrayNoteSizeAndPosition}
                        />
                    );
                })}
                <div className="absolute bottom-6 right-6 rounded-full z-50">
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button className="flex justify-center items-center rounded-full size-12 bg-card">
                                <Plus className="size-6 text-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-100 border-0" onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) createNoteHandler(createNoteTitle, createNoteTheme, createNoteTag) }}>
                            <div className="grid ">
                                <div className="mb-2 flex">
                                    <Label className="text-2xl">새 노트 생성</Label>
                                    <div className="flex border  items-center ml-auto h-4 p-1 rounded-md bg-muted ">
                                        <Label className="text-xs text-muted-foreground">Alt+n</Label>
                                    </div>
                                </div>
                                <div className="flex flex-col my-2">
                                    <Label className="w-20 text-muted-foreground my-2">노트 제목</Label>
                                    <Input value={createNoteTitle} onChange={(e) => { setCreateNoteTitleError(false); setCreateNoteErrorMessage(""); setCreateNoteTitle(e.target.value) }} placeholder="노트 제목을 입력해주세요." className={createNoteTitleError ? "border-destructive w-full" : "w-full"} />
                                    <Label className="text-destructive mt-1">{createNoteErrorMessage}</Label>
                                </div>
                                <div className="flex flex-col my-2">
                                    <Label className="w-20 text-muted-foreground my-2">노트 태그</Label>
                                    <Input value={createNoteTag} onChange={(e) => { setCreateNoteTag(e.target.value) }} placeholder="과목, 계획표 등 태그를 입력해주세요." />
                                </div>
                                <div className="flex flex-col mt-2 mb-8">
                                    <Label className="w-20 text-muted-foreground my-2">노트 테마</Label>
                                    <div>
                                        <RadioGroup value={createNoteTheme} onValueChange={setCreateNoteTheme} className="grid grid-cols-9 gap-1">
                                            {noteThemes.map((theme) => (
                                                <Tooltip key={theme.name}>
                                                    <TooltipTrigger asChild>
                                                        <RadioGroupItem
                                                            value={theme.name}
                                                            style={{ backgroundColor: theme.color }}
                                                            className={`size-8 rounded-full border-2 ${createNoteTheme === theme.name ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'} hover:scale-110 transition-all`}
                                                        >
                                                        </RadioGroupItem>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{theme.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </div>
                                <div>
                                    <Button onClick={() => createNoteHandler(createNoteTitle, createNoteTheme, createNoteTag)} className="w-full">생성</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </NoteSidebar>
    )
}