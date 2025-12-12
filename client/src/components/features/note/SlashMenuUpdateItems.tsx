import { BlockNoteEditor } from "@blocknote/core";
import { type DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from "@blocknote/react";

export interface CustomSlashMenuItem extends DefaultReactSuggestionItem {
    [key: string]: any;
}

export const getCustomSlashMenuUpdateItems = async (
    editor: BlockNoteEditor
): Promise<CustomSlashMenuItem[]> => {
    // 기본 아이템 가져오기
    const allItems = await getDefaultReactSlashMenuItems(editor);

    const allowedTitles = [
        "Heading 1",
        "Heading 2",
        "Heading 3",
        "Heading 4",
        "Heading 5",
        "Heading 6",
        "Quote",
        "Toggle List",
        "Numbered List",
        "Check List",
        "Bullet List",
        "Code Block",
        "Image",
        "Table",
        "Paragraph",
        "Divider",
        "Toggle Heading 1",
        "Toggle Heading 2",
        "Toggle Heading 3",
    ];

    return allItems
        .filter((item) => allowedTitles.includes(item.title))
        .map((item) => {
            let update = {};

            switch (item.title) {
                case "Heading 1":
                    update = { type: "heading", props: { level: 1 } };
                    break;
                case "Heading 2":
                    update = { type: "heading", props: { level: 2 } };
                    break;
                case "Heading 3":
                    update = { type: "heading", props: { level: 3 } };
                    break;
                case "Heading 4":
                    update = { type: "heading", props: { level: 4 } };
                    break;
                case "Heading 5":
                    update = { type: "heading", props: { level: 5 } };
                    break;
                case "Heading 6":
                    update = { type: "heading", props: { level: 6 } };
                    break;
                case "Paragraph":
                    update = { type: "paragraph" };
                    break;
                case "Bullet List":
                    update = { type: "bulletListItem" };
                    break;
                case "Numbered List":
                    update = { type: "numberedListItem" };
                    break;
                case "Check List":
                    update = { type: "checkListItem" };
                    break;
                case "Toggle List":
                    update = { type: "toggleListItem" };
                    break;
                case "Quote":
                    update = { type: "blockquote" };
                    break;
                case "Code Block":
                    update = { type: "codeBlock" };
                    break;
                case "Image":
                    update = { type: "image" };
                    break;
                case "Table":
                    update = { type: "table" };
                    break;
                case "Divider":
                    update = { type: "divider" };
                    break;
                case "Toggle Heading 1":
                    update = { type: "heading", props: { level: 1 } };
                    break;
                case "Toggle Heading 2":
                    update = { type: "heading", props: { level: 2 } };
                    break;
                case "Toggle Heading 3":
                    update = { type: "heading", props: { level: 3 } };
                    break;
            }

            return {
                ...item,
                update: update,
            };
        }) as CustomSlashMenuItem[];
};
