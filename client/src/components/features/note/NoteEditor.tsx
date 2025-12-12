import {
    useCreateBlockNote,
    SideMenuController,
    SideMenu,
    RemoveBlockItem,
    DragHandleMenu,
    DragHandleButton,
    SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import "@blocknote/core/fonts/inter.css";


import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { getCustomSlashMenuUpdateItems, type CustomSlashMenuItem } from "@/components/features/note/SlashMenuUpdateItems";
import { CustomSlashMenu } from "./CustomSlashMenu";
import { getCustomSlashMenuItems } from "./SlashMenuItems";
import { useTheme } from "@/contexts/ThemeProvider";

interface Props {
    saveData: (data: Array<any>) => void;
    initContent: Array<any>;
    theme?: string;
}

export default function NoteEditor({ saveData, initContent, theme }: Props) {
    const globalTheme = useTheme().theme;
    // Create a new editor instance
    const editor = useCreateBlockNote({
        initialContent: initContent && initContent.length > 0 ? initContent : undefined,
        placeholders: {
            default: "내용을 입력하거나 '/'를 눌러 명령어를 사용하세요.",
        }
    });

    const CustomSideHandleMenu = (props: any) => (
        // @ts-ignore
        <DragHandleMenu {...props}>
            <RemoveBlockItem {...props}>
                <div className="flex items-center gap-1">
                    <Trash2 className="size-4" />
                    <Label>삭제</Label>
                </div>
            </RemoveBlockItem>
        </DragHandleMenu>
    )

    const handleSave = async () => {
        const contents = editor.document;
        saveData(contents);
    }
    // Render the editor
    return (
        <BlockNoteView editor={editor} className={theme} theme={(globalTheme as "dark" | "light")} sideMenu={false} slashMenu={false} onChange={handleSave} >
            <SideMenuController sideMenu={(props) => (
                <SideMenu {...props}>
                    <DragHandleButton {...props} dragHandleMenu={CustomSideHandleMenu} />
                </SideMenu>
            )} />
            <SuggestionMenuController
                triggerCharacter=";"
                suggestionMenuComponent={CustomSlashMenu}
                getItems={async (query) => {
                    // 커스텀 슬래시 메뉴 항목 가져오기
                    const items = await getCustomSlashMenuUpdateItems(editor);
                    // 검색어 필터링
                    return items.filter((item) =>
                        item.title.toLowerCase().includes(query.toLowerCase())
                    );
                }}
                onItemClick={(item) => {
                    const currentBlock = editor.getTextCursorPosition().block;
                    const customItem = item as CustomSlashMenuItem;
                    if (customItem.update) {
                        editor.updateBlock(currentBlock, customItem.update);
                    }
                }}
            />
            <SuggestionMenuController
                triggerCharacter="/"
                suggestionMenuComponent={CustomSlashMenu}
                getItems={async (query) => {
                    // 커스텀 슬래시 메뉴 항목 가져오기
                    const items = await getCustomSlashMenuItems(editor);
                    // 검색어 필터링
                    return items.filter((item) =>
                        item.title.toLowerCase().includes(query.toLowerCase())
                    );
                }}
                onItemClick={(item) => {
                    item.onItemClick()
                }}
            />
        </BlockNoteView>
    );
}