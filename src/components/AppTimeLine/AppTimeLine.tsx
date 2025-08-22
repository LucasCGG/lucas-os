import { useEffect, useRef, useState } from "react";

type TItem = { year: string; title: string; sub?: string | any };

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(e?.contentRect.width ?? 0));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

export function Timeline({
  items,
  horizontalMin = 760,
}: {
  items: TItem[];
  horizontalMin?: number;
}) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const horizontal = width >= horizontalMin;

  if (horizontal) {
    return (
      <div ref={ref} className="mt-10">
        <div className="flex px-1">
          {items.map((t) => (
            <div key={t.year} className="flex-1 text-center text-sm font-semibold text-text-muted">
              {t.year}
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          {items.map((t, i) => (
            <div key={`dot-${t.year}`} className="relative flex flex-1 items-center justify-center">
              {i > 0 && (
                <span className="absolute left-0 top-1/2 h-[3px] w-1/2 -translate-y-1/2 bg-accent_orange/80" />
              )}
              {i < items.length - 1 && (
                <span className="absolute right-0 top-1/2 h-[3px] w-1/2 -translate-y-1/2 bg-accent_orange/80" />
              )}
              <span className="relative z-10 h-4 w-4 rounded-full border-2 border-border bg-background" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex px-1 text-center text-sm text-text-muted">
          {items.map((t) => (
            <div key={`cap-${t.year}`} className="flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.sub ? <p className="opacity-80">{t.sub}</p> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="mt-8">
      <ol className="relative py-1">
        <span className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 bg-accent_orange/80" />

        {items.map((t, i) => {
          const onLeft = i % 2 === 0;

          const Content = (
            <div
              className={`text-sm leading-6 text-text-muted ${onLeft ? "text-right" : "text-left"}`}
            >
              <div className="font-semibold">{t.year}</div>
              <div className="mt-1 font-semibold">{t.title}</div>
              {t.sub ? <div className="mt-1 opacity-80">{t.sub}</div> : null}
            </div>
          );

          return (
            <li key={t.year} className="grid grid-cols-[1fr_28px_1fr] items-start gap-3 py-5">
              {onLeft ? Content : <div />}

              <div className="flex justify-center">
                <span className="relative top-1 h-4 w-4 rounded-full border-2 border-border bg-background" />
              </div>

              {!onLeft ? Content : <div />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
