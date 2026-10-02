import { openDialog, useDialogStore } from "../../atoms/dialogs";
import type { DialogSpec } from "../../atoms/dialogs";
import { useWindowStore } from "../../atoms/store";

const OS_NAME = "LucasOS";

const dialogImage = (src: string, className: string) => (
    <img src={src} alt="" draggable={false} className={`pointer-events-none ${className}`} />
);

export const taskFailedDialog = (): DialogSpec => ({
    title: OS_NAME,
    message: "Task Faild Successfull!",
    buttons: [{ label: "Great!" }],
});

export const screwedDialog = (): DialogSpec => ({
    title: "oh ouh",
    icon: dialogImage("/assets/dialogs/screw.svg", "h-12 w-auto"),
    message: "You're screwd.",
    buttons: [{ label: "Damn" }],
});

export const guiltyDialog = (): DialogSpec => ({
    title: "You look guilty",
    message: "What are you hiding?",
    buttons: [{ label: "Nothing..." }, { label: "My passwords" }],
});

export const sleepyDialog = (): DialogSpec => ({
    title: "sleepy",
    message: "laptopi is tired!",
    buttons: [
        { label: "lets sleep!", onClick: () => useDialogStore.getState().setSleeping(true) },
    ],
});


const virusDialog = (): DialogSpec => ({
    title: "Emergency",
    message: "Virus found inside of mouse senor.",
    buttons: [{ label: "OK" }, { label: "Clear Viruses", onClick: () => openDialog(taskFailedDialog()) }],
});

const booDialog = (): DialogSpec => ({
    title: "BOO",
    message: "BOO!",
    shake: true,
    buttons: [{ label: "AAAH!" }, { label: "not scared" }],
});

const screamDialog = (): DialogSpec => ({
    title: "A".repeat(32),
    message: "A".repeat(108),
    buttons: [{ label: "AAAAAA" }, { label: "aaaa?" }],
});

const catDialog = (): DialogSpec => ({
    title: "Purrrr",
    icon: dialogImage("/assets/dialogs/cat.svg", "h-20 w-20"),
    message: "Do you LOVE cats??",
    buttons: [{ label: "YES" }, { label: "Yes, i do" }],
});

const stunningDialog = (): DialogSpec => ({
    title: "beauty",
    message: "YOU ARE STUNNING!!",
    buttons: [{ label: "i know" }],
});

const duckDialog = (): DialogSpec => ({
    title: "quack",
    icon: dialogImage("/assets/dialogs/duck.svg", "h-16 w-auto [image-rendering:pixelated]"),
    message: "The duck is watching.\nThe duck has always been watching.",
    buttons: [
        { label: "quack" },
        {
            label: "Read manifesto",
            onClick: () =>
                useWindowStore.getState().openApp("pdfviewer", {
                    props: { fileName: { node: { src: "/files/easter-eggs/duck_manifesto.pdf" } } },
                }),
        },
    ],
});

export const RANDOM_DIALOGS: (() => DialogSpec)[] = [
    virusDialog,
    booDialog,
    screamDialog,
    catDialog,
    stunningDialog,
    duckDialog,
    taskFailedDialog,
    guiltyDialog,
    screwedDialog,
];
