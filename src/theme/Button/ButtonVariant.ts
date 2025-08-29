export const buttonVariantMap = {
    solid: {
        base: "btn-retro p-1",
    },
    ghost: {
        base: "btn-ghost",
    },
} as const;

export type ButtonVariant = keyof typeof buttonVariantMap;
