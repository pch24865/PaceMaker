import { Rnd } from "react-rnd";
import NoteEditor from "@/components/features/note/NoteEditor";
import { useEffect, useRef, useState, memo } from "react";
import { toast } from "sonner";
import { saveNote } from "@/lib/api";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { noteThemes } from "@/lib/noteThemes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, SquareArrowOutDownLeft, SquareArrowOutDownRight, SquareArrowOutUpLeft, SquareArrowOutUpRight } from "lucide-react";

interface Props {
    id: string;
    title: string;
    theme: string;
    tag: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    contents: Array<any>;
    isFullScreen: boolean;
    onDragStop: (id: string, x: number, y: number) => void;
    onResizeStop: (id: string, width: number, height: number, x: number, y: number) => void;
    onContentChange: ({ id, title, theme, tag, contents }: { id: string, title: string, theme: string, tag: string, contents: Array<any> }) => void;
    onFocus: (id: string) => void;
    switchFullScreen: (id: string) => void;
    onClose: (id: string) => void;
    onDelete: (id: string) => void;
    arrayNoteSizeAndPosition: (noteId: string, xRate: number, yRate: number, widthRate: number, heightRate: number) => void;
}

function NoteWindow({
    id,
    title,
    theme,
    tag,
    x,
    y,
    width,
    height,
    zIndex,
    contents,
    isFullScreen, // New Prop
    onDragStop,
    onResizeStop,
    onContentChange,
    onFocus,
    switchFullScreen,
    onClose,
    onDelete,
    arrayNoteSizeAndPosition
}: Props) {
    const isSaving = useRef<NodeJS.Timeout | null>(null);
    const [saveMessage, setSaveMessage] = useState<string>("");
    const [noteTheme, setNoteTheme] = useState<string>(theme);
    const [changeNoteTitleError, setChangeNoteTitleError] = useState<boolean>(false);
    const [changeNoteTitleMessage, setChangeNoteTitleMessage] = useState<string>("");
    const [isInteracting, setIsInteracting] = useState(false); // Interaction state

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState<string>(title);
    const [noteTag, setNoteTag] = useState<string>(tag);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (saveMessage === "수정된 노트" || saveMessage === "저장 중...") {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [saveMessage]);

    // 노트 데이터 (title, contents, tag, theme) 즉시 저장
    async function saveNoteDataInstant(newTitle: string, newTheme: string, newTag: string) {
        onContentChange({ id, title: newTitle, theme: newTheme, tag: newTag, contents });
        if (isSaving.current) {
            clearTimeout(isSaving.current);
        }
        try {
            await saveNote({
                id,
                title: newTitle,
                theme: newTheme,
                tag: newTag,
                contents,
            });
            setSaveMessage(`저장됨`);
            setTimeout(() => setSaveMessage(""), 1500);
        } catch (error: any) {
            if (error.response) {
                toast(error.response.data.message);
                setSaveMessage("저장 실패");
                return;
            }
        }
    }

    // 노트 데이터 (title, contents, tag, theme) 저장 (시간 차 두고 저장.)
    async function saveNoteData(newContents: any[]) {
        onContentChange({ id, title, theme, tag, contents: newContents });
        if (isSaving.current) {
            clearTimeout(isSaving.current);
        }
        if (!saveMessage) {
            setSaveMessage("저장 중...");
        }
        isSaving.current = setTimeout(async () => {
            setSaveMessage("저장 중...");
            try {
                await saveNote({
                    id,
                    contents: newContents,
                    theme,
                    tag,
                    title,
                });
                setSaveMessage(`저장됨`);
                setTimeout(() => setSaveMessage(""), 1500);
            } catch (error: any) {
                if (error.response) {
                    toast(error.response.data.message);
                    setSaveMessage("저장 실패");
                    return;
                }
            } finally {
                isSaving.current = null;
            }
        }, 5000); // 몇 초 간 변경없을 시 저장할 지 설정.
    }

    const onNoteDataChangeSubmit = () => {
        const noteTitleSchma = z.string().min(1, "노트 제목을 입력해주세요.");
        const result = noteTitleSchma.safeParse(noteTitle);
        if (!result.success) {
            setChangeNoteTitleError(true);
            setChangeNoteTitleMessage(result.error.issues[0].message);
            return;
        }

        saveNoteDataInstant(noteTitle, noteTheme, noteTag);
        setIsDialogOpen(false);
        setChangeNoteTitleError(false);
        setChangeNoteTitleMessage("");
    }

    return (
        <AlertDialog>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) {
                    setNoteTitle(title);
                    setNoteTag(tag);
                    setNoteTheme(theme);
                    setChangeNoteTitleError(false);
                    setChangeNoteTitleMessage("");
                }
            }}>

                <Rnd
                    default={{
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                    }}
                    bounds=".bounds"
                    position={{ x: x, y: y }}
                    size={{ width: width, height: height }}
                    minWidth={320}
                    minHeight={200}
                    disableDragging={isFullScreen} // Disable drag in fullscreen
                    enableResizing={!isFullScreen} // Disable resize in fullscreen
                    onDragStart={() => { setIsInteracting(true); onFocus(id); }}
                    onResizeStart={() => { setIsInteracting(true); onFocus(id); }}
                    onResizeStop={(_e, _direction, ref, _delta, position) => {
                        setIsInteracting(false);
                        const newWidth = parseInt(ref.style.width);
                        const newHeight = parseInt(ref.style.height);
                        onResizeStop(id, newWidth, newHeight, position.x, position.y);
                    }}
                    onDragStop={(_e, d) => {
                        setIsInteracting(false);
                        onDragStop(id, d.x, d.y);
                    }}
                    onMouseDown={() => onFocus(id)}
                    className={`rounded-md shadow-2xl ${theme} border-0 bg-(--note-background) ${!isInteracting ? "transition-all duration-300 ease-in-out" : ""}`}
                    style={{ zIndex }}
                    dragHandleClassName="drag-handle"
                >
                    <div className="w-full h-full flex flex-col gap-0 rounded-md">
                        <ContextMenu>
                            <ContextMenuTrigger asChild>
                                <div className="drag-handle flex items-center h-6 w-full cursor-move rounded-t-md bg-ring m-0">
                                    <Label className="text-(--note-text-color) cursor-move block m-1 truncate">{title}</Label>
                                    <Label className="text-(--note-text-color)/50 cursor-move block truncate">#{tag === "" ? "미분류" : tag}</Label>
                                    <Label className={`text-(--note-text-color)/50 cursor-move block ml-auto whitespace-nowrap ${saveMessage ? "opacity-100 duration-100" : "opacity-0"}`}>{saveMessage}</Label>
                                    <Button onClick={() => switchFullScreen(id)} size="icon" aria-label="Minimize" className={`no-drag cursor-pointer h-3 w-3 ${saveMessage ? "ml-2" : "ml-auto"} p-0 bg-green-500 hover:bg-green-600`} />
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" aria-label="Close" className="group no-drag cursor-pointer h-3 w-3 ml-1 p-0 bg-yellow-400 hover:bg-yellow-500" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-full">
                                            <DropdownMenuLabel>윈도우 이동 및 크기조정</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0, 0, 0.5, 1)}><ArrowLeftToLine /> 왼쪽</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0.5, 0, 0.5, 1)}><ArrowRightToLine /> 오른쪽</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0, 0, 1, 0.5)}><ArrowUpToLine /> 위쪽</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0, 0.5, 1, 0.5)}><ArrowDownToLine /> 아래쪽</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0, 0, 0.5, 0.5)}><SquareArrowOutUpLeft /> 왼쪽 상단</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0.5, 0, 0.5, 0.5)}><SquareArrowOutUpRight /> 오른쪽 상단</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0, 0.5, 0.5, 0.5)}><SquareArrowOutDownLeft /> 왼쪽 하단</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => arrayNoteSizeAndPosition(id, 0.5, 0.5, 0.5, 0.5)}><SquareArrowOutDownRight /> 오른쪽 하단</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button onClick={() => onClose(id)} size="icon" aria-label="Close" className="group no-drag cursor-pointer h-3 w-3 ml-1 mr-2 p-0 bg-red-500 hover:bg-red-600" />
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <DialogTrigger asChild>
                                    <ContextMenuItem className="cursor-pointer">노트 속성 변경</ContextMenuItem>
                                </DialogTrigger>
                                <ContextMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <ContextMenuItem className="text-destructive focus:bg-destructive/30 focus:text-foreground cursor-pointer">
                                        삭제
                                    </ContextMenuItem>
                                </AlertDialogTrigger>
                            </ContextMenuContent>
                        </ContextMenu>

                        <div className={`flex-1 w-full overflow-auto bg-(--note-background) rounded-b-md ${isFullScreen ? "max-w-5xl mx-auto py-4" : ""} transition-all duration-300 ease-in-out`}>
                            <NoteEditor saveData={saveNoteData} initContent={contents} theme={theme} />
                        </div>
                    </div>
                </Rnd>
                <DialogContent className="sm:max-w-[425px]" onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        onNoteDataChangeSubmit();
                    }
                }}>
                    <DialogHeader>
                        <DialogTitle>노트 속성 변경</DialogTitle>
                        <DialogDescription>
                            노트 속성을 변경하세요.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="title">제목</Label>
                            <Input
                                id="title"
                                value={noteTitle}
                                placeholder="노트 제목을 입력해주세요."
                                onChange={(e) => {
                                    setNoteTitle(e.target.value);
                                    setChangeNoteTitleError(false);
                                    setChangeNoteTitleMessage("");
                                }}
                                className={changeNoteTitleError ? "border-destructive" : ""}
                            />
                            {changeNoteTitleError && <Label className="text-destructive text-sm">{changeNoteTitleMessage}</Label>}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="tag">태그</Label>
                            <Input id="tag" value={noteTag} placeholder="과목, 계획표 등 태그를 입력해주세요." onChange={(e) => setNoteTag(e.target.value)} />
                        </div>
                        <Label className="w-20 text-muted-foreground my-2">노트 테마</Label>
                        <div>
                            <RadioGroup value={noteTheme} onValueChange={setNoteTheme} className="grid grid-cols-9 gap-1">
                                {noteThemes.map((theme) => (
                                    <Tooltip key={theme.name}>
                                        <TooltipTrigger asChild>
                                            <RadioGroupItem
                                                value={theme.name}
                                                style={{ backgroundColor: theme.color }}
                                                className={`size-8 rounded-full border-2 ${noteTheme === theme.name ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'} hover:scale-110 transition-all`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{theme.tooltip}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
                        <Button type="submit" onClick={onNoteDataChangeSubmit}>저장</Button>
                    </DialogFooter>
                </DialogContent>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>노트 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            노트 삭제 시 데이터를 복구할 수 없습니다. 그래도 삭제하시겠습니까?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/80" onClick={() => onDelete(id)}>삭제</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </Dialog>
        </AlertDialog >
    );
};

export default memo(NoteWindow);