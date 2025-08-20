import { ButtonSize, buttonSizeMap } from '../../theme';
import { AppIcon } from '../AppIcon';

interface AppIconButtonProps {
  icon: string;
  onClick: () => void;
  size?: ButtonSize;
  withBackground?: boolean;
  className?: string;
}

export const AppIconButton = ({
  icon,
  onClick,
  size = 'sm',
  withBackground = true,
  className,
}: AppIconButtonProps) => {
  const { icon: iconSize } = buttonSizeMap[size];

  return (
    <button
      onClick={onClick}
      className={`btn-retro-icon ${withBackground ? 'retro-3d' : ''} ${className}`}
    >
      {icon && <AppIcon icon={icon} size={iconSize} />}
    </button>
  );
};
