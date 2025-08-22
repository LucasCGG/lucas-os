export const iconSizeMap = {
  auto: 'w-full',
  '2xs': 'w-2 h-2',
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4.5 h-4.5',
  lg: 'w-5.5 h-5.5',
  xl: 'w-7 h-7',
  '2xl': 'w-8 h-8',
  full: 'w-full',
} as const;

export type IconSize = keyof typeof iconSizeMap;
