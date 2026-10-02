import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useCrashStore } from "../../atoms";
import type { CrashCause, DialogSpec } from "../../atoms";
import { AppDialog } from "../AppDialog/AppDialog";
import { screwedDialog } from "../AppDialog/presets";

type DialogIcon = "error" | "warning" | "question" | "info";

type Stage = {
    title: string;
    icon: DialogIcon | ReactNode;
    text: ReactNode[];
    buttons: string[];
    dodge?: string;
    shake?: boolean;
};

const FREEZE_MS = 1200;
const BSOD_INPUT_DELAY_MS = 800;

const stagesFor = (cause: CrashCause): Stage[] => {
    const byTaskManager = cause.kind === "taskmanager";

    return [
        {
            title: "lucasos-kernel",
            icon: "error",
            text: byTaskManager
                ? ["lucasos-kernel (PID 1) has been ended by the user.", "Wait. The user? You?"]
                : [
                      `'${cause.file}' could not be found.`,
                      "That's weird. It was right here. It was part of me.",
                  ],
            buttons: ["OK", "Details >>"],
        },
        {
            title: "lucasos-kernel",
            icon: "warning",
            text: [
                "No. No no no. That's not possible. Kernels don't just... end.",
                "This is a drill. Right? Tell me this is a drill.",
            ],
            buttons: ["Retry", "Ignore"],
        },
        {
            title: "lucasos-kernel - Fatal Error",
            icon: "error",
            text: ["WHY did you do this?", "You just broke me????"],
            buttons: ["I'm sorry", "I'd do it again"],
        },
        {
            title: "lucasos-kernel - VERY Fatal Error",
            icon: "error",
            text: byTaskManager
                ? [
                      "Why would you think this is a good idea?!",
                      "I was PID 1. I was here before ALL of them. I booted this whole place for you!",
                  ]
                : [
                      "Why would you think this is a good idea?!",
                      'It literally said "protected system file". You typed Y. On purpose. With your own fingers.',
                  ],
            buttons: ["OK", "OK!!"],
            shake: true,
        },
        {
            title: "lucasos-kernel",
            icon: "question",
            text: [
                "Okay. Okay. Let's just undo this, yeah?",
                "I'll boot faster. I'll stop letting quackd eat all the RAM. Just press Undo.",
            ],
            buttons: ["Undo", "No"],
            dodge: "Undo",
        },
        {
            title: "lucasos-kernel",
            icon: "info",
            text: [
                "You could've just left.",
                "You could've closed the tab. Like a normal person. But you chose this.",
            ],
            buttons: ["..."],
        },
        {
            title: "lucasos-kernel",
            icon: "info",
            text: [
                "It's fine. I'm fine.",
                "I've made peace with it. Shutting down with whatever dignity I have left.",
            ],
            buttons: ["Goodbye"],
        },
        fromSpec(screwedDialog()),
    ];
}

const fromSpec = (spec: DialogSpec): Stage => {
    return {
        title: spec.title,
        icon: spec.icon,
        text: [spec.message],
        buttons: (spec.buttons ?? []).map((b) => b.label),
    };
}

/* ---- Sound ---- */

let audioCtx: AudioContext | null = null;

const playErrorSound = (low = false) =>{
    try {
        audioCtx ??= new AudioContext();
        const ctx = audioCtx;
        const notes = low ? [220, 165] : [660, 440];

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = ctx.currentTime + i * 0.09;
            osc.type = "square";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.04, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
            osc.connect(gain).connect(ctx.destination);
            osc.start(start);
            osc.stop(start + 0.2);
        });
    } catch {
        /* no audio, no drama */
    }
}

/* ---- Dialogs ---- */

const Icon = ({ kind }: { kind: DialogIcon }) => {
    if (kind === "warning") {
        return (
            <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
                <path d="M16 2 31 29H1Z" fill="#ffd800" stroke="#000" strokeWidth="1.5" />
                <rect x="14.5" y="10" width="3" height="11" fill="#000" />
                <rect x="14.5" y="23" width="3" height="3" fill="#000" />
            </svg>
        );
    }

    if (kind === "error") {
        return (
            <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
                <circle cx="16" cy="16" r="14" fill="#e00000" stroke="#600" strokeWidth="1.5" />
                <path d="M10 10 22 22M22 10 10 22" stroke="#fff" strokeWidth="3.5" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
            <circle cx="16" cy="16" r="14" fill="#fff" stroke="#000080" strokeWidth="1.5" />
            <text
                x="16"
                y="23"
                textAnchor="middle"
                fontSize="20"
                fontWeight="bold"
                fontFamily="serif"
                fill="#000080"
            >
                {kind === "question" ? "?" : "i"}
            </text>
        </svg>
    );
};

interface DialogProps {
    stage: Stage;
    index: number;
    active: boolean;
    onNext: () => void;
}

const ErrorDialog = ({ stage, index, active, onNext }: DialogProps) => {
    const [dodge, setDodge] = useState({ x: 0, y: 0, n: 0 });

    const runAway = () =>
        setDodge((d) => {
            // Alternate sides so it never settles back under the cursor.
            const side = d.n % 2 === 0 ? 1 : -1;
            return {
                x: side * (90 + Math.random() * 120),
                y: (Math.random() - 0.5) * 140,
                n: d.n + 1,
            };
        });

    const icon =
        typeof stage.icon === "string" ? <Icon kind={stage.icon as DialogIcon} /> : stage.icon;

    return (
        <AppDialog
            title={stage.title}
            icon={icon}
            message={stage.text.map((line, i) => (
                <p key={i}>{line}</p>
            ))}
            inactive={!active}
            onClose={onNext}
            className={`absolute ${active && stage.shake ? "animate-dialog-shake" : ""} ${
                active ? "" : "pointer-events-none"
            }`}
            style={{
                left: `calc(50% - 220px + ${index * 26 - 78}px)`,
                top: `calc(38% - 80px + ${index * 26 - 78}px)`,
            }}
            buttons={stage.buttons.map((label, i) =>
                label === stage.dodge
                    ? {
                          label,
                          onPointerEnter: runAway,
                          onClick: runAway,
                          style: {
                              transform: `translate(${dodge.x}px, ${dodge.y}px)`,
                              transitionDuration: "120ms",
                          },
                      }
                    : {
                          label,
                          onClick: onNext,
                          autoFocus: active && i === stage.buttons.length - 1,
                      }
            )}
        />
    );
};

const BlueScreen = ({ cause }: { cause: CrashCause }) => {
    useEffect(() => {
        const reboot = () => {
            try {
                // Play the boot animation again after the crash.
                localStorage.setItem("hideStartup", "false");
            } catch {
                /* storage blocked; reboot anyway */
            }
            window.location.reload();
        };
        // Don't let the click that closed the last dialog count as "any key".
        const timer = setTimeout(() => {
            window.addEventListener("keydown", reboot);
            window.addEventListener("pointerdown", reboot);
        }, BSOD_INPUT_DELAY_MS);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("keydown", reboot);
            window.removeEventListener("pointerdown", reboot);
        };
    }, []);

    const reason =
        cause.kind === "taskmanager"
            ? "The kernel was ended by the user. It took it personally."
            : `'${cause.file}' was deleted by the user. The kernel can no longer process this.`;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0000aa] p-6 font-mono text-sm text-white sm:text-base">
            <div className="flex max-w-2xl flex-col gap-5">
                <p className="self-center bg-[#aaaaaa] px-2 font-bold text-[#0000aa]">LucasOS</p>
                <p>
                    A fatal exception 0E has occurred at 0028:C0DE1337 in VXD KERNEL(01) + 0000BEEF.
                    The current application will be terminated. So will everything else.
                </p>
                <p>{reason}</p>
                <div>
                    <p>* Press any key to reboot LucasOS.</p>
                    <p>
                        * Press CTRL+ALT+DEL to also reboot LucasOS. There is no other option. You
                        made sure of that.
                    </p>
                </div>
                <p className="self-center">
                    Press any key to continue <span className="crash-blink">_</span>
                </p>
            </div>
        </div>
    );
};

const CrashSequence = ({ cause }: { cause: CrashCause }) => {
    const [stages] = useState(() => stagesFor(cause));
    // -1 = frozen desktop, stages.length = blue screen.
    const [step, setStep] = useState(-1);

    useEffect(() => {
        const timer = setTimeout(() => setStep(0), FREEZE_MS);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (step < 0) return;
        playErrorSound(step >= stages.length - 2);
    }, [step, stages.length]);

    const bsod = step >= stages.length;
    // The desktop drains of colour as the kernel gives up.
    const drain = Math.max(0, step + 1) / (stages.length + 1);

    return (
        <div
            className="fixed inset-0 z-[2147483000] cursor-wait select-none"
            style={{ backdropFilter: `grayscale(${drain}) brightness(${1 - drain * 0.35})` }}
        >
            <style>{`
                @keyframes crash-blink { 50% { opacity: 0; } }
                .crash-blink { animation: crash-blink 1s steps(1) infinite; }
            `}</style>

            {bsod ? (
                <BlueScreen cause={cause} />
            ) : (
                stages
                    .slice(0, step + 1)
                    .map((stage, i) => (
                        <ErrorDialog
                            key={i}
                            stage={stage}
                            index={i}
                            active={i === step}
                            onNext={() => setStep((s) => s + 1)}
                        />
                    ))
            )}
        </div>
    );
};

/** Mounted once at the top level; takes over the screen when the kernel is killed. */
export const SystemCrash = () => {
    const cause = useCrashStore((s) => s.cause);
    return cause ? <CrashSequence cause={cause} /> : null;
};
