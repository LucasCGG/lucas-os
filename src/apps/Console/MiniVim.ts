import type { Terminal } from "xterm";

type Mode = "NORMAL" | "INSERT" | "CMDLINE";

export type BufferSpec = {
    filename: string;
    text: string;
    onSave?: (t: string) => void;
};

export type VimUiState = {
    mode: Mode;
    filename: string;
    dirty: boolean;
    bufferIndex: number;
    bufferCount: number;
    cursor: { line: number; col: number };
    cmdline?: string;
};

export class MiniVim {
    term: Terminal;
    mode: Mode = "NORMAL";
    cmd = "";

    bufs: { filename: string; lines: string[]; dirty: boolean; onSave?: (t: string) => void }[] =
        [];

    bi = 0;
    cx = 0;
    cy = 0;
    top = 0;
    left = 0;
    rows = 24;
    cols = 80;

    onExit?: (saved?: boolean) => void;
    onUi?: (u: VimUiState) => void;

    subData: { dispose(): void } | null = null;
    subResize: { dispose(): void } | null = null;

    constructor(term: Terminal, specs: BufferSpec[], onExit?: (saved?: boolean) => void) {
        this.term = term;
        this.onExit = onExit;

        const normalized = specs.length ? specs : [{ filename: "[No Name]", text: "" }];
        this.bufs = normalized.map((s) => ({
            filename: s.filename,
            lines: s.text.replace(/\r\n/g, "\n").split("\n"),
            dirty: false,
            onSave: s.onSave,
        }));

        this.rows = term.rows;
        this.cols = term.cols;
        this.attach();
        this.render();
    }

    // ---- lifecycle ----
    attach() {
        this.subData = this.term.onData((d) => this.onKey(d));
        this.subResize = this.term.onResize(({ rows, cols }) => {
            this.rows = rows;
            this.cols = cols;
            this.render();
        });
        this.term.write("\x1b[?25h");
    }
    detach() {
        this.subData?.dispose();
        this.subResize?.dispose();
    }

    // ---- helpers ----
    cur() {
        return this.bufs[this.bi];
    }
    clamp() {
        const b = this.cur();
        this.cy = Math.max(0, Math.min(this.cy, b.lines.length - 1));
        const len = (b.lines[this.cy] ?? "").length;
        this.cx = Math.max(0, Math.min(this.cx, len));
    }
    ensureVisible() {
        const bodyH = Math.max(1, this.rows - 2);
        const gw = this.gutterWidth();
        const bodyW = Math.max(1, this.cols - gw);
        if (this.cy < this.top) this.top = this.cy;
        if (this.cy >= this.top + bodyH) this.top = this.cy - bodyH + 1;
        if (this.cx < this.left) this.left = this.cx;
        if (this.cx >= this.left + bodyW) this.left = this.cx - bodyW + 1;
    }
    gutterWidth() {
        const maxLine = Math.max(1, this.cur().lines.length);
        return Math.max(2, String(maxLine).length) + 2;
    }
    emitUi() {
        const b = this.cur();
        this.onUi?.({
            mode: this.mode,
            filename: b.filename,
            dirty: b.dirty,
            bufferIndex: this.bi,
            bufferCount: this.bufs.length,
            cursor: { line: this.cy + 1, col: this.cx + 1 },
            cmdline: this.mode === "CMDLINE" ? this.cmd : undefined,
        });
    }

    // ---- rendering ----
    render() {
        const b = this.cur();
        const rows = this.rows,
            cols = this.cols;
        const bodyH = Math.max(1, rows - 2);
        const gw = this.gutterWidth();
        const bodyW = Math.max(1, cols - gw);

        this.term.write("\x1b[2J\x1b[H");

        const tabs = this.bufs
            .map((buf, i) =>
                i === this.bi
                    ? ` [${buf.filename}${buf.dirty ? "*" : ""}] `
                    : `  ${buf.filename}${buf.dirty ? "*" : ""}  `
            )
            .join("");
        this.term.write("\x1b[7m" + (tabs + " ".repeat(cols)).slice(0, cols) + "\x1b[0m\r\n");

        for (let r = 0; r < bodyH; r++) {
            const i = this.top + r;
            const raw = b.lines[i] ?? "";
            const isCur = i === this.cy;
            const rel = isCur ? i + 1 : Math.abs(i - this.cy);
            const num = String(rel).padStart(gw - 2, " ");
            const content = raw.slice(this.left, this.left + bodyW);
            this.term.write(num + " " + "│" + content + "\x1b[K" + (r < bodyH - 1 ? "\r\n" : ""));
        }

        // Statusline (bottom)
        const mode = this.mode.toLowerCase();
        const right = `${b.filename}${b.dirty ? " [+]" : ""}  ${this.cy + 1},${this.cx + 1}`;
        const left = this.mode === "CMDLINE" ? `:${this.cmd}` : mode;
        const pad = Math.max(1, cols - left.length - right.length - 1);
        const status = left + " ".repeat(pad) + right;
        this.term.write(
            "\r\n\x1b[7m" +
                status.slice(0, cols) +
                " ".repeat(Math.max(0, cols - status.length)) +
                "\x1b[0m"
        );

        // Cursor
        const curRow = Math.min(bodyH - 1, Math.max(0, this.cy - this.top));
        const curCol = gw + Math.min(bodyW - 1, Math.max(0, this.cx - this.left));
        this.term.write(`\x1b[${curRow + 2};${curCol + 1}H`);

        this.emitUi();
    }

    // ---- editing primitives ----
    pushChar(ch: string) {
        const b = this.cur();
        const line = b.lines[this.cy] ?? "";
        b.lines[this.cy] = line.slice(0, this.cx) + ch + line.slice(this.cx);
        this.cx += ch.length;
        b.dirty = true;
    }
    newline() {
        const b = this.cur();
        const line = b.lines[this.cy] ?? "";
        const left = line.slice(0, this.cx),
            right = line.slice(this.cx);
        b.lines[this.cy] = left;
        b.lines.splice(this.cy + 1, 0, right);
        this.cy++;
        this.cx = 0;
        b.dirty = true;
    }
    backspace() {
        const b = this.cur();
        if (this.cx > 0) {
            const line = b.lines[this.cy];
            b.lines[this.cy] = line.slice(0, this.cx - 1) + line.slice(this.cx);
            this.cx--;
            b.dirty = true;
            return;
        }
        if (this.cy > 0) {
            const prev = b.lines[this.cy - 1];
            const cur = b.lines[this.cy];
            const joinAt = prev.length;
            b.lines[this.cy - 1] = prev + cur;
            b.lines.splice(this.cy, 1);
            this.cy--;
            this.cx = joinAt;
            b.dirty = true;
        }
    }

    // ---- keys ----
    _await: "g" | null = null;

    /**
     *  Motions
     *  h    Left
     *  j    Down
     *  k    Up
     *  l    Right
     *  w    Move forward to the beginning of the next word
     *  }    Jump to the next paragraph
     *  $    Go to the end of the line
     */

    /**
     * Operators
     * y    Yank text(copy)
     * d    Delete text and save to register
     * c    Delet text, save to register, and start insert mode
     */



    onKey(d: string) {
        // arrows
        console.debug("onKey d", d);
        if (d === "\x1b[A") {
            this.cy--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "\x1b[B") {
            this.cy++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "\x1b[C") {
            this.cx++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "\x1b[D") {
            this.cx--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }

        if (d === "\x04") {
            // Ctrl-D half page down
            const half = Math.max(1, Math.floor((this.rows - 2) / 2));
            this.cy += half;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "\x15") {
            // Ctrl-U half page up
            const half = Math.max(1, Math.floor((this.rows - 2) / 2));
            this.cy -= half;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }

        if (this.mode === "INSERT") return this.onInsert(d);
        if (this.mode === "CMDLINE") return this.onCmd(d);
        return this.onNormal(d);
    }

    onNormal(d: string) {
        const b = this.cur();
        const line = b.lines[this.cy] ?? "";
        if (d === "\x1b") return;
        if (d === "h") {
            this.cx--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "j") {
            this.cy++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "k") {
            this.cy--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "l") {
            this.cx++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === "0") {
            this.cx = 0;
            this.ensureVisible();
            return this.render();
        }
        if (d === "$") {
            this.cx = line.length;
            this.ensureVisible();
            return this.render();
        }

        if (d === "g") {
            this._await = "g";
            return;
        }
        if (this._await === "g" && d === "g") {
            this._await = null;
            this.cy = 0;
            this.cx = 0;
            this.ensureVisible();
            return this.render();
        }
        if (d === "G") {
            this.cy = Math.max(0, b.lines.length - 1);
            this.cx = 0;
            this.ensureVisible();
            return this.render();
        }
        if (this._await) {
            this._await = null;
        }

        if (d === "i") {
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "I") {
            this.cx = 0;
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "a") {
            this.cx++;
            this.clamp();
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "A") {
            this.cx = (b.lines[this.cy] ?? "").length;
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "o") {
            this.newline();
            this.mode = "INSERT";
            this.ensureVisible();
            return this.render();
        }
        if (d === "O") {
            this.newline();
            this.cy = Math.max(0, this.cy - 1);
            this.mode = "INSERT";
            this.ensureVisible();
            return this.render();
        }

        if (d === "x") {
            if (this.cx < (b.lines[this.cy] ?? "").length) {
                b.lines[this.cy] =
                    (b.lines[this.cy] ?? "").slice(0, this.cx) +
                    (b.lines[this.cy] ?? "").slice(this.cx + 1);
                b.dirty = true;
                this.ensureVisible();
                this.render();
            }
            return;
        }

        if (d === ":") {
            this.mode = "CMDLINE";
            this.cmd = "";
            return this.render();
        }
    }

    onInsert(d: string) {
        if (d === "\x1b") {
            this.mode = "NORMAL";
            return this.render();
        }
        if (d === "\r") {
            this.newline();
            this.ensureVisible();
            return this.render();
        }
        if (d === "\x7f") {
            this.backspace();
            this.ensureVisible();
            return this.render();
        }
        if (d >= " " && d !== "\x7f") {
            this.pushChar(d);
            this.ensureVisible();
            return this.render();
        }
    }

    onCmd(d: string) {
        if (d === "\x1b") {
            this.mode = "NORMAL";
            this.cmd = "";
            return this.render();
        } // ESC
        if (d === "\x7f") {
            this.cmd = this.cmd.slice(0, -1);
            return this.render();
        } // Backspace
        if (d === "\r") {
            const c = this.cmd.trim();
            this.cmd = "";
            if (c === "q" || c === "quit") return this.quit(false);
            if (c === "w" || c === "write") {
                this.save();
                this.mode = "NORMAL";
                return this.render();
            }
            if (c === "wq" || c === "x") {
                this.save();
                return this.quit(true);
            }
            this.mode = "NORMAL";
            return this.render();
        }
        if (d >= " ") {
            this.cmd += d;
            return this.render();
        }
    }

    save() {
        const b = this.cur();
        const text = b.lines.join("\n");
        b.dirty = false;
        b.onSave?.(text);
    }

    quit(saved: boolean) {
        this.detach();
        this.term.write("\x1b[2J\x1b[H");
        this.onExit?.(saved);
    }
}
