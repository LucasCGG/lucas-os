import { useState } from "react";
import { AppIconButton } from "../../components";

export const Browser = () => {
    const [value, setValue] = useState<string>("https://www.google.com/webhp?igu=1");

    // TODO: Create a browser header with search bar etc.
    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex w-full gap-4 bg-black px-4 py-2">
                {/* TODO: Import correct icons for "Previous" "Next" and "Reload" */}
                <AppIconButton
                    onClick={() => {}}
                    icon="icn-logo-simple"
                    variant="ghost"
                    size="md"
                />
                <AppIconButton
                    onClick={() => {}}
                    icon="icn-logo-simple"
                    variant="ghost"
                    size="md"
                />
                <AppIconButton
                    onClick={() => {}}
                    icon="icn-logo-simple"
                    variant="ghost"
                    size="md"
                />
                <input
                    placeholder="Search"
                    value={value}
                    className="w-full"
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            <iframe
                id="broswer-iframe"
                title="browser"
                width="100%"
                height="100%"
                src={value}
            ></iframe>
        </div>
    );
};
