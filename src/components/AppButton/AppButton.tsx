import { ButtonSize, buttonSizeMap } from "../../theme";
import { AppIcon } from "../AppIcon";

interface AppButtonProps {
  onClick: () => void;
  iconStart?: string;
  iconEnd?: string;
  text?: string;
  size?: ButtonSize;
  disabled?: boolean;
}

export const AppButton = ({
  onClick,
  iconStart,
  iconEnd,
  text,
  size = "md",
  disabled,
}: AppButtonProps) => {
  const { icon: iconSize, text: textSize} = buttonSizeMap[size];

  return (
    <button onClick={onClick} className="retro-3d btn-retro" disabled={disabled}>
      {iconStart && <AppIcon icon={iconStart} size={iconSize} />}
      {text && <span>{text}</span>}
      {iconEnd && <AppIcon icon={iconEnd} size={iconSize} />}
    </button>
  );
};
