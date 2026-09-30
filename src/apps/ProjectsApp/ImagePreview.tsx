import { useEffect, useRef } from "react";
import { AppIcon } from "../../components";
import { useTrans } from "../../hooks/useTrans";

export type PreviewImage = {
    src: string;
    name: string;
    caption?: string;
};

export const ImagePreview = ({
    images,
    index,
    bottomInset,
    onChange,
    onClose,
}: {
    images: PreviewImage[];
    index: number;
    bottomInset: number;
    onChange: (index: number) => void;
    onClose: () => void;
}) => {
    const { t } = useTrans();
    const ref = useRef<HTMLDivElement | null>(null);
    const count = images.length;
    const image = images[index];

    const step = (delta: number) => onChange((index + delta + count) % count);

    // Focus the overlay so arrow keys / Escape only apply to this window.
    useEffect(() => {
        ref.current?.focus({ preventScroll: true });
    }, []);

    return (
        <div
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-label={image.caption ?? image.name}
            onClick={onClose}
            onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
                if (e.key === "ArrowLeft") step(-1);
                if (e.key === "ArrowRight") step(1);
            }}
            className="absolute inset-x-0 top-0 z-20 flex flex-col bg-black/85 p-3 text-text-light outline-none"
            style={{ bottom: bottomInset }}
        >
            <div className="flex items-center justify-between gap-2 pb-2">
                <p className="truncate text-sm">
                    {image.name}
                    {image.caption && <span className="opacity-60"> — {image.caption}</span>}
                </p>
                <button
                    onClick={onClose}
                    aria-label={t("app.projects.closePreview")}
                    className="btn-retro-icon shrink-0 rounded bg-background"
                >
                    <AppIcon icon="icn-close" size="md" />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center gap-2">
                {count > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            step(-1);
                        }}
                        aria-label={t("app.projects.previous")}
                        className="btn-retro-icon shrink-0 rounded-full bg-white/10 p-2"
                    >
                        <AppIcon icon="icn-arrow-left" size="md" />
                    </button>
                )}
                <img
                    src={image.src}
                    alt={image.caption ?? image.name}
                    onClick={(e) => e.stopPropagation()}
                    className="max-h-full min-w-0 max-w-full border-2 border-white/20 object-contain"
                />
                {count > 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            step(1);
                        }}
                        aria-label={t("app.projects.next")}
                        className="btn-retro-icon shrink-0 rounded-full bg-white/10 p-2"
                    >
                        <AppIcon icon="icn-arrow-right" size="md" />
                    </button>
                )}
            </div>

            {count > 1 && (
                <p className="pt-2 text-center text-xs opacity-60">
                    {index + 1} / {count}
                </p>
            )}
        </div>
    );
};
