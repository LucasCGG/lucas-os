import { loaderProgressModern } from "./loaderProgressModern";
import { loaderRetroSplash } from "./loaderRetroSplash";
import { loaderStylized } from "./loaderStylized";

type Frames = string[] | Iterable<string> | AsyncIterable<string>;
type Loader = Frames | (() => Frames | Promise<Frames>);

const loaders: Loader[] = [loaderProgressModern, loaderRetroSplash, loaderStylized];

export const getRandomLoader = (): Loader => loaders[Math.floor(Math.random() * loaders.length)];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const chance = (p: number) => Math.random() < p;
const sleepJitter = async (baseMs: number, jitterRatio: number) => {
  const jitter = baseMs * rand(-jitterRatio, jitterRatio);
  await sleep(Math.max(0, baseMs + jitter));
};

async function toAsyncIterable(src: Loader): Promise<AsyncIterable<string>> {
  const resolved = typeof src === "function" ? await src() : src;

  if (resolved && Symbol.asyncIterator in (resolved as any)) {
    return resolved as AsyncIterable<string>;
  }
  if (resolved && Symbol.iterator in (resolved as any)) {
    const iter = resolved as Iterable<string>;
    return (async function* () {
      for (const x of iter) yield x;
    })();
  }
  throw new TypeError("Loader must return frames (array/iterable/async iterable).");
}

type ParsedProgress = {
  pre: string;
  post: string;
  width: number;
  filledChar: string;
  emptyChar: string;
  headChar: string;
  targetPercent: number | null;
};

function parseProgressLine(line: string): ParsedProgress | null {
  const m = line.match(/^(?<pre>.*)\[(?<bar>[^\]]+)\](?<post>.*)$/);
  if (!m || !m.groups) return null;

  const pre = (m.groups.pre ?? "").trimEnd();
  const barInner = m.groups.bar ?? "";
  const post = m.groups.post ?? "";

  const pm = post.match(/(?<pct>\d{1,3})\s*%/);
  const targetPercent = pm ? Math.min(100, parseInt(pm.groups!.pct!, 10)) : null;

  const hasModern = /[■□]/.test(barInner);
  const filledChar = hasModern ? "■" : "█";
  const emptyChar = hasModern ? "□" : " ";
  const headChar = hasModern ? "" : "▌";
  const width = barInner.length;

  return { pre, post, width, filledChar, emptyChar, headChar, targetPercent };
}

function renderBar(
  percent: number,
  width: number,
  filledChar: string,
  emptyChar: string,
  headChar: string
): string {
  const filled = Math.floor((percent / 100) * width);
  if (headChar && percent > 0 && percent < 100) {
    const body = Math.max(0, filled - 1);
    return `${filledChar.repeat(body)}${headChar}${emptyChar.repeat(Math.max(0, width - body - 1))}`;
  }
  return `${filledChar.repeat(filled)}${emptyChar.repeat(Math.max(0, width - filled))}`;
}

type ProgressTiming = {
  frameDelay: number;
  jitterRatio: number;
  longPauseChance: number;
  longPauseRange: [number, number];
};

async function animateProgressLine(
  instance: { write: (s: string) => void },
  parsed: ParsedProgress,
  _currentPercent: number | null,
  timing: ProgressTiming
): Promise<number> {
  const { pre, post, width, filledChar, emptyChar, headChar, targetPercent } = parsed;
  const start = 0;
  const visibleEnd = targetPercent ?? 100;

  const prefix = pre ? `${pre} ` : "";
  let p = start;

  // STEP 1 — Animate to the target percentage (or 100% if no target)
  const frames = Math.max(width * 2, 10);
  const baseStep = Math.max(1, Math.round((visibleEnd - start) / frames));

  while (p < visibleEnd) {
    const step = Math.max(1, Math.round(baseStep * rand(0.7, 1.4)));
    p = Math.min(visibleEnd, p + step);

    const bar = renderBar(p, width, filledChar, emptyChar, headChar);
    const percentText = post.includes("%") ? post.replace(/\d{1,3}\s*%/, `${p}%`) : post;
    instance.write(`\r\x1b[2K${prefix}[${bar}]${percentText}`);

    await sleepJitter(timing.frameDelay, timing.jitterRatio);

    if (chance(timing.longPauseChance) && p > start && p < visibleEnd) {
      const [minMs, maxMs] = timing.longPauseRange;
      await sleep(rand(minMs, maxMs));
    }
  }

  // STEP 2 — Always finish to 100% smoothly, even if target < 100
  if (p < 100) {
    const fastFrames = Math.max(6, Math.round((100 - p) / 2));
    const fastStep = Math.max(1, Math.round((100 - p) / fastFrames));

    while (p < 100) {
      p = Math.min(100, p + fastStep);

      const bar = renderBar(p, width, filledChar, emptyChar, headChar);
      const percentText = post.includes("%") ? post.replace(/\d{1,3}\s*%/, `${p}%`) : post;

      instance.write(`\r\x1b[2K${prefix}[${bar}]${percentText}`);
      await sleep(Math.max(20, timing.frameDelay * 0.4));
    }
  }

  // STEP 3 — Print newline after finishing
  instance.write("\n");
  return 100;
}

export async function playRandomLoader(
  instance: { writeln: (s: string) => void },
  writePrompt: () => void,
  perLineDelay = 120,
  progressFrameDelay = 60
) {
  const stream = await toAsyncIterable(getRandomLoader());
  let currentPercent: number | null = null;

  const timing: ProgressTiming = {
    frameDelay: progressFrameDelay,
    jitterRatio: 0.45, // ±45% randomness per frame
    longPauseChance: 0.08, // 8% of frames add an extra pause
    longPauseRange: [180, 650], // 180–650ms extra pause
  };

  for await (const line of stream) {
    const parsed = parseProgressLine(line);
    if (!parsed) {
      instance.writeln(line);
      await sleepJitter(perLineDelay, 0.35);
      continue;
    }
    currentPercent = await animateProgressLine(instance, parsed, currentPercent, timing);
  }

  writePrompt();
}
