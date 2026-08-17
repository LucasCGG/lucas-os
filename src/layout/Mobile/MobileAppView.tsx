// MobileAppView.tsx
import { ReactNode } from "react";

interface MobileAppViewProps {
    children: ReactNode;
}

// Phone apps render edge-to-edge with no window chrome of their own —
// navigating away happens through the dock, never a close button here.
export const MobileAppView = ({ children }: MobileAppViewProps) => {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </div>
    );
};
