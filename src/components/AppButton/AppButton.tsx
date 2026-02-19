import { ButtonSize, buttonSizeMap } from "../../theme";
import { AppIcon } from "../AppIcon";

interface AppButtonProps {
    onClick: () => void;
    icon?: string;
    text?: string;
    size?: ButtonSize;
    disabled?: boolean;
    position?: "start" | "end";
}

export const AppButton = ({
    onClick,
    icon,
    text,
    size = "md",
    disabled,
    position = "start",
}: AppButtonProps) => {
  const { icon: iconSize, text: textSize} = buttonSizeMap[size];

    return (
        <button onClick={onClick} className="retro-3d btn-retro" disabled={disabled}>
            {icon && position === "start" && <AppIcon icon={icon} size={iconSize} />}
            {text && <span>{text}</span>}
            {icon && position === "end" && <AppIcon icon={icon} size={iconSize} />}
        </button>
    );
};
