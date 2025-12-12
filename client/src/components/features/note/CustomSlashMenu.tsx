import type { SuggestionMenuProps } from "@blocknote/react";
import { Label } from "@/components/ui/label";
import type { CustomSlashMenuItem } from "@/components/features/note/SlashMenuItems";


export const CustomSlashMenu = (
    props: SuggestionMenuProps<CustomSlashMenuItem>,
) => {
    return (
        <div className="z-50 min-w-32 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            {props.items.map((item, index) => (
                <div
                    key={index}
                    className={`relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ${props.selectedIndex === index
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                    onClick={() => {
                        props.onItemClick?.(item);
                    }}
                >
                    <div className="flex items-center size-6 p-1 rounded-md bg-accent">
                        {item.icon}
                    </div>
                    <Label className="mr-4">{item.title}</Label>
                    {item.badge ? <div className="flex items-center ml-auto h-4 p-1 rounded-md bg-accent">
                        <Label className="text-xs text-neutral-400">{item.badge}</Label>
                    </div> : null}

                </div>
            ))}
        </div>
    );
}
