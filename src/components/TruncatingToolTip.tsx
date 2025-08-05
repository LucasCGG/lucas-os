import * as React from "react";

interface Props {
    children: string;
    as?: React.ElementType;
    className?: string;
    lineClamp?: number;
}

export const TruncatingTooltipText = ({
    children,
    as: Component = "p",
    className = "",
    lineClamp,
}: Props) => {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const [isTruncated, setIsTruncated] = React.useState(false);

    React.useEffect(() => {
        const checkOverflow = () => {
            const el = ref.current;
            if (!el) return;

            const hasHorizontalOverflow = el.scrollWidth > el.clientWidth;
            const hasVerticalOverflow = el.scrollHeight > el.clientHeight;

            setIsTruncated(lineClamp ? hasVerticalOverflow : hasHorizontalOverflow);
        };

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [children, lineClamp]);

    const truncationStyles: React.CSSProperties = lineClamp
        ? {
            display: "-webkit-box",
            WebkitLineClamp: lineClamp,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
        }
        : {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        };

    return (
        <div ref={ref} className={`relative ${className}`} style={truncationStyles}>
            <Component className="contents">{children}</Component>
        </div>
    );
};
