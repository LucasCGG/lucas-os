const ESC = "\x1b";
const CSI = "\x1b[";

export const VIM_CORE_KEYMAP = {
    // Navigatio
    ArrowUp: `${CSI}A`,
    ArrowDown: `${CSI}B`,
    ArrowRight: `${CSI}C`,
    ArrowLeft: `${CSI}D`,

    // Enter / Return
    Enter_CR: "\r",
    Enter_LF: "\n",

    Escape: `${ESC}`,

    Backspace: "\x7f",
    Backspace2: "\x08",

    // Vim normal mode are just letters (l: "l")

    CtrlD: "\x04",
    CtrlU: "\x15",
} as const;

export const VIM_EXTRA_KEYMAP = {
    // Home / End
    Home_SS3: "\x1bOH",
    End_SS3: "\x1bOF",
    Home_CSI: `${CSI}H`,
    END_CSI: `${CSI}F`,

    PageUp: `${CSI}5~`,
    PageDown: `${CSI}6~`,

    Insert: `${CSI}2~`,
    Delete: `${CSI}3~`,

    Tab: "\t",
    ShiftTab: `${CSI}Z`,

    // Ctrl-letters (terminal control codes)
    // NOTE: Ctrl+A → \x01 ... Ctrl+Z → \x1a
    CtrlA: "\x01",
    CtrlB: "\x02",
    CtrlC: "\x03",
    CtrlE: "\x05",
    CtrlF: "\x06",
    CtrlG: "\x07",
    CtrlH: "\x08",
    CtrlI: "\x09",
    CtrlJ: "\x0a",
    CtrlK: "\x0b",
    CtrlL: "\x0c",
    CtrlM: "\x0d",
    CtrlN: "\x0e",
    CtrlO: "\x0f",
    CtrlP: "\x10",
    CtrlQ: "\x11",
    CtrlR: "\x12",
    CtrlS: "\x13",
    CtrlT: "\x14",
    CtrlV: "\x16",
    CtrlW: "\x17",
    CtrlX: "\x18",
    CtrlY: "\x19",
    CtrlZ: "\x1a",
    CtrlLB: "\x1b", // Ctrl+[  (ESC)
    CtrlBS: "\x1c", // Ctrl+\
    CtrlRB: "\x1d", // Ctrl-]
    Ctrl6: "\x1e", // Ctrl-^
    Ctrl_: "\x1f", // Ctrl-_
    CtrlSpace: "\x00",
};

export const MOD_CURSOR = {
    Shift_Up: `${CSI}1;2A`,
    Shift_Down: `${CSI}1;2B`,
    Shift_Right: `${CSI}1;2C`,
    Shift_Left: `${CSI}1;2D`,
    Alt_Up: `${CSI}1;3A`,
    Alt_Down: `${CSI}1;3B`,
    Alt_Right: `${CSI}1;3C`,
    Alt_Left: `${CSI}1;3D`,
    Ctrl_Up: `${CSI}1;5A`,
    Ctrl_Down: `${CSI}1;5B`,
    Ctrl_Right: `${CSI}1;5C`,
    Ctrl_Left: `${CSI}1;5D`,
} as const;
