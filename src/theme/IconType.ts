export const iconSizeMap = {
    auto: "w-full",
    "2xs": "w-2 h-2",
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-6 h-6",
    lg: "w-7 h-7",
    xl: "w-8 h-8",
    "2xl": "w-10 h-10",
    full: "w-full",
} as const;

export type IconSize = keyof typeof iconSizeMap;
