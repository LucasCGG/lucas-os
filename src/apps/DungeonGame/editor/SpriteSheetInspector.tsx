import { useEffect, useMemo, useRef, useState } from "react";
import { InspectorRegistry } from "../sprites/InspectorRegistry";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { Animator } from "../sprites/Animator";
import { Animation } from "../sprites/Animation";
import { SpriteFrame } from "../sprites/types";
import { AppIconButton } from "../../../components";

export function SpriteSheetInspector({ onClose }: { onClose: () => void }) {
  const [, force] = useState(0);
  useEffect(() => InspectorRegistry.subscribe(() => force((n) => n + 1)), []);

  const sheets = InspectorRegistry.list();
  const [selected, setSelected] = useState(0);
  const entry = sheets[selected] ?? sheets[0];
  const sheetName = entry?.name;

  const [fw, setFw] = useState(64);
  const [fh, setFh] = useState(64);
  const [sequence, setSequence] = useState<number[]>([]);
  const [duration, setDuration] = useState(0.08);
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    if (entry) {
      setFw(entry.sheet.getFrameWidth());
      setFh(entry.sheet.getFrameHeight());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetName]);

  useEffect(() => {
    if (entry) entry.sheet.setFrameSize(fw, fh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetName, fw, fh]);

  const total = entry ? entry.sheet.getTotalFrames() : 0;

  const indices = useMemo(() => {
    if (!entry) return [];
    entry.sheet.setFrameSize(fw, fh);           // reslice here
    return Array.from({ length: entry.sheet.getTotalFrames() }, (_, i) => i);
  }, [sheetName, fw, fh]);

  const code = useMemo(() => {
    const arr = `[${sequence.join(", ")}]`;
    return `const anim = new Animation("walk", sheet, ${arr}, ${duration}, ${loop});`;
  }, [sequence, duration, loop]);

  return (
    <div className="absolute right-2 top-12 bottom-2 z-10 flex w-80 flex-col gap-3 overflow-y-auto rounded-lg border border-white/15 bg-[#12121a]/95 p-3 text-white/90 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide">◈ SPRITE SHEET INSPECTOR</span>

        <AppIconButton icon="icn-close" onClick={onClose} />
        {/*<button onClick={onClose} className="rounded px-2 text-white/60 hover:bg-white/10">
          X
        </button>*/}
      </div>

      {!entry ? (
        <p className="text-sm text-white/60">No sprite sheets registered yet.</p>
      ) : (
        <>
          {sheets.length > 1 && (
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="rounded border border-white/15 bg-black/40 px-2 py-1 text-sm"
            >
              {sheets.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2 text-sm">
            <label className="text-white/60">W</label>
            <NumberField value={fw} onChange={setFw} />
            <label className="text-white/60">H</label>
            <NumberField value={fh} onChange={setFh} />
            <span className="ml-auto text-xs text-white/50">{total} frames</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {indices.map((i) => (
              <FrameThumb
                key={i}
                sheet={entry.sheet}
                index={i}
                size={40}
                onClick={() => setSequence((seq) => [...seq, i])}
              />
            ))}
          </div>

          <div className="text-xs text-white/60">Sequence (click a frame above to append):</div>
          <div className="flex min-h-[26px] flex-wrap gap-1">
            {sequence.length === 0 ? (
              <span className="text-xs text-white/40">empty</span>
            ) : (
              sequence.map((frameIndex, pos) => (
                <button
                  key={`${pos}-${frameIndex}`}
                  onClick={() => setSequence((seq) => seq.filter((_, p) => p !== pos))}
                  className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200 hover:bg-red-500/30"
                  title="remove"
                >
                  {frameIndex}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="w-24">Frame: {duration.toFixed(2)}s</span>
            <input
              type="range"
              min={0.02}
              max={0.5}
              step={0.01}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-white/70">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            loop
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">preview</span>
            <SequencePreview
              sheet={entry.sheet}
              sequence={sequence}
              duration={duration}
              loop={loop}
              size={56}
            />
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <code className="block break-all rounded bg-black/50 p-2 text-[11px] text-emerald-200">
              {code}
            </code>
            <button
              onClick={() => void navigator.clipboard?.writeText(code)}
              className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            >
              Copy as code
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NumberField({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      className="w-16 rounded border border-white/15 bg-black/40 px-1 py-0.5"
    />
  );
}

function FrameThumb({
  sheet,
  index,
  size,
  onClick,
}: {
  sheet: SpriteSheet;
  index: number;
  size: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const frame = sheet.getFrame(index);
    if (frame) {
      ctx.drawImage(frame.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, canvas.width, canvas.height);
    }
  }, [sheet, index, size]);

  return (
    <button
      onClick={onClick}
      className="relative border border-white/15 bg-black/30 hover:border-emerald-400"
      title={`frame ${index}`}
    >
      <canvas ref={ref} width={size} height={size} className="block" />
      <span className="absolute left-0 top-0 bg-black/60 px-1 text-[10px] text-white/80">{index}</span>
    </button>
  );
}

function SequencePreview({
  sheet,
  sequence,
  duration,
  loop,
  size,
}: {
  sheet: SpriteSheet;
  sequence: number[];
  duration: number;
  loop: boolean;
  size: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || sequence.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animator = new Animator();
    animator.addAnimation(new Animation("preview", sheet, sequence, duration, loop));
    animator.play("preview");

    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      animator.update((now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const frame: SpriteFrame | null = animator.getCurrentFrame();
      if (frame) {
        ctx.drawImage(frame.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sheet, sequence, duration, loop]);

  return <canvas ref={ref} width={size} height={size} className="border border-white/15 bg-black/30" />;
}
