export const buttonSizeMap = {
  '2xs': {
    icon: '2xs',
    text: 'text-[10px]',
    gap: 'gap-1',
    px: 'px-1.5',
    py: 'py-0.5',
  },
  xs: {
    icon: 'xs',
    text: 'text-xs',
    gap: 'gap-1.5',
    px: 'px-2',
    py: 'py-1',
  },
  sm: {
    icon: 'sm',
    text: 'text-sm',
    gap: 'gap-2',
    px: 'px-2.5',
    py: 'py-1.5',
  },
  md: {
    icon: 'md',
    text: 'text-base',
    gap: 'gap-2',
    px: 'px-4',
    py: 'py-2.5',
  },
  lg: {
    icon: 'md',
    text: 'text-lg',
    gap: 'gap-3',
    px: 'px-4',
    py: 'py-3',
  },
  xl: {
    icon: 'xl',
    text: 'text-xl',
    gap: 'gap-3',
    px: 'px-6',
    py: 'py-3.5',
  },
  '2xl': {
    icon: '2xl',
    text: 'text-2xl',
    gap: 'gap-3.5',
    px: 'px-6',
    py: 'py-3.5',
  },
  full: {
    icon: 'full',
    text: 'text-2xl',
    gap: 'gap-3.5',
    px: 'px-6',
    py: 'py-3.5',
  },
} as const;

export type ButtonSize = keyof typeof buttonSizeMap;
