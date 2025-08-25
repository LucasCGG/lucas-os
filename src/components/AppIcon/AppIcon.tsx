import { IconSize, iconSizeMap } from "../../theme";

interface AppIconProps {
    icon: string;
    size?: IconSize;
    className?: string;
}

export const AppIcon = ({ icon, className = "", size = "md" }: AppIconProps) => {
    const sizeClass = iconSizeMap[size];

    return (
        <svg className={`${sizeClass} ${className}`} viewBox="0 0 512 512" aria-hidden="true">
            <use href={`#${icon}`} />
        </svg>
    );
};
