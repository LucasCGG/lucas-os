import { useState } from "react";
import { AppIconButton } from "../../components";

const bookmarks = [
    { label: "Pure Perfection", url: "https://pureperfection.ch" },
    { label: "CSA Design", url: "https://csadesign.ch" },
    { label: "Cota Elektro", url: "https://cota-elektro.ch" },
    { label: "GitHub", url: "https://github.com/LucasCGG" },
];

export const Browser = () => {
    const [value, setValue] = useState<string>("https://www.google.com/webhp?igu=1");
    const [src, setSrc] = useState<string>(value);

    const navigate = (url: string) => {
        setValue(url);
        setSrc(url);
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex w-full gap-4 bg-black px-4 py-2">
                {/* TODO: Import correct icons for "Previous" "Next" and "Reload" */}
                {/*<AppIconButton onClick={() => {}} icon="icn-logo-simple" variant="ghost" size="md" />
                <AppIconButton onClick={() => {}} icon="icn-logo-simple" variant="ghost" size="md" />
                <AppIconButton onClick={() => navigate(value)} icon="icn-logo-simple" variant="ghost" size="md" />*/}
                <input
                    placeholder="Search"
                    value={value}
                    className="w-full"
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") navigate(value);
                    }}
                />
            </div>

            <div id="bookmark-row" className="flex w-full gap-2 bg-black px-4 py-2">
                {bookmarks.map((bm) => (
                    <button
                        key={bm.url}
                        onClick={() => navigate(bm.url)}
                        title={bm.label}
                        className="flex items-center gap-2 rounded px-2 py-1 text-sm text-white hover:bg-white/10"
                    >
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${bm.url}&sz=32`}
                            alt=""
                            width={16}
                            height={16}
                        />
                        <span>{bm.label}</span>
                    </button>
                ))}
            </div>

            <iframe
                id="browser-iframe"
                title="browser"
                width="100%"
                height="100%"
                src={src}
            ></iframe>
        </div>
    );
};
