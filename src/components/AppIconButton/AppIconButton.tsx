import { ButtonSize, buttonSizeMap, ButtonVariant, buttonVariantMap } from "../../theme";
import { AppIcon } from "../AppIcon";

interface AppIconButtonProps {
    icon: string;
    onClick: () => void;
    size?: ButtonSize;
    variant?: ButtonVariant;
    className?: string;
    disabled?: boolean;
}

export const AppIconButton = ({
    icon,
    onClick,
    size = "sm",
    variant = "solid",
    className,
    disabled,
}: AppIconButtonProps) => {
    const { icon: iconSize } = buttonSizeMap[size];
    const { base: base } = buttonVariantMap[variant];

    return (
        <button
            onClick={onClick}
            className={`cursor-hand ${base} aspect-square ${className}`}
            disabled={disabled}
        >
            {icon && <AppIcon icon={icon} size={iconSize} />}
        </button>
    );
};
