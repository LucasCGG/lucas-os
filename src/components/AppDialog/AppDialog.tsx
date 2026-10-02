import { useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { AppIconButton } from "../AppIconButton";

export type AppDialogButton = {
    label: string;
    onClick?: () => void;
    onPointerEnter?: () => void;
    autoFocus?: boolean;
    style?: CSSProperties;
};

export interface AppDialogProps {
    title: string;
    message: ReactNode;
    icon?: ReactNode;
    buttons?: AppDialogButton[];
    onClose?: () => void;
    inactive?: boolean;
    onTitlePointerDown?: (e: PointerEvent<HTMLDivElement>) => void;
    className?: string;
    style?: CSSProperties;
}

const FRAME_LIGHT = "#A9D5A4";
const FRAME_DARK = "#5F5F5F";
const BUTTON_RAISED = "inset 1px 1px 0 #fff, inset -1px -1px 0 #b9b6b8, 2px 2px 0 #8a8789";
const BUTTON_PRESSED = "inset 2px 2px 0 #8a8789, inset -1px -1px 0 #fff";

const DialogButton = ({ label, onClick, onPointerEnter, autoFocus, style }: AppDialogButton) => {
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            onPointerEnter={onPointerEnter}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerLeave={() => setPressed(false)}
            autoFocus={autoFocus}
            className="h-9 min-w-0 max-w-[220px] flex-1 truncate bg-[#E6E3E5] px-3 text-sm text-black outline-none transition-transform focus-visible:outline-dotted focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-black"
            style={{ boxShadow: pressed ? BUTTON_PRESSED : BUTTON_RAISED, ...style }}
        >
            {label}
        </button>
    );
};

export const AppDialog = ({
    title,
    message,
    icon,
    buttons = [],
    onClose,
    inactive,
    onTitlePointerDown,
    className = "",
    style,
}: AppDialogProps) => (
    <div
        role="alertdialog"
        aria-label={title}
        className={`flex w-[440px] max-w-[calc(100vw-2rem)] select-none flex-col bg-[#D9D4D3] text-black ${className}`}
        style={{
            borderStyle: "solid",
            borderWidth: 3,
            borderColor: `${FRAME_LIGHT} ${FRAME_DARK} ${FRAME_DARK} ${FRAME_LIGHT}`,
            boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
            ...style,
        }}
    >
        <div
            onPointerDown={onTitlePointerDown}
            className={`flex h-10 items-center justify-between gap-3 px-3 text-text-light ${
                onTitlePointerDown ? "draggable touch-none" : ""
            } ${inactive ? "bg-[#9a7d68]" : "bg-sidebar"}`}
        >
            <span className="truncate text-sm">{title}</span>
            <span className="flex shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                <AppIconButton
                    size="sm"
                    icon="icn-close"
                    onClick={() => onClose?.()}
                    disabled={!onClose}
                />
            </span>
        </div>

        <div className="flex min-h-[84px] items-center justify-center gap-6 px-5 py-5">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="min-w-0 whitespace-pre-line break-words text-center text-sm leading-relaxed">
                {message}
            </div>
        </div>

        {buttons.length > 0 && (
            <div className="flex justify-center gap-3 px-5 pb-5">
                {buttons.map((b) => (
                    <DialogButton key={b.label} {...b} />
                ))}
            </div>
        )}
    </div>
);
