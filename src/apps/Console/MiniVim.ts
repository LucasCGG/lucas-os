import type { Terminal } from "xterm";
import { VIM_CORE_KEYMAP } from "./VimKeyMap";

type Mode = "NORMAL" | "INSERT" | "VISUAL" | "CMDLINE";

export type Pos = { line: number; col: number };
export type Range = { start: Pos; end: Pos; kind: "char" | "line"; inclusive?: boolean };

export type MotionFn = (count: number) => Range;
export type OperatorFn = (range: Range, count: number) => boolean;

export type OperatorSpec = {
    id: string;
    wantsMotion: boolean;
    handler: OperatorFn;
};

export type TrieNode<T> = { val?: T; next: Map<string, TrieNode<T>> };

export class KeyTrie<T> {
    root: TrieNode<T> = { next: new Map() };
    add(keys: string[], value: T) {
        let n = this.root;
        for (const k of keys) {
            if (!n.next.has(k)) n.next.set(k, { next: new Map() });
            n = n.next.get(k)!;
        }
        n.val = value;
    }
}

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

    vkind: null | "char" | "line" = null;
    vAnchor: { line: number; col: number } | null = null;

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

    motionTrie = new KeyTrie<MotionFn>();
    operatorTrie = new KeyTrie<OperatorSpec>();

    pendingCount1: number | null = null;
    pendingOp: OperatorSpec | null = null;
    pendingCount2: number | null = null;
    opNode: TrieNode<OperatorSpec> | null = null;
    motionNode: TrieNode<MotionFn> | null = null;

    lastChange: null | {
        op: string;
        count1: number | null;
        count2: number | null;
        motionSeq: string[];
        arg?: string;
    } = null;

    registerBuiltins() {
        // --- motions ---
        this.motionTrie.add(["h"], (n) => this.mkRangeMove(n, { dx: -1, dy: 0 }));
        this.motionTrie.add(["l"], (n) => this.mkRangeMove(n, { dx: +1, dy: 0 }));
        this.motionTrie.add(["j"], (n) => this.mkRangeLine(n, +1));
        this.motionTrie.add(["k"], (n) => this.mkRangeLine(n, -1));
        this.motionTrie.add(["0"], (_) => ({
            start: this.pos(),
            end: { line: this.cy, col: 0 },
            kind: "char",
        }));
        this.motionTrie.add(["$"], (_) => ({
            start: this.pos(),
            end: { line: this.cy, col: this.curLine().length },
            kind: "char",
            inclusive: true,
        }));
        this.motionTrie.add(["g", "g"], (_) => ({
            start: this.pos(),
            end: { line: 0, col: 0 },
            kind: "line",
        }));
        this.motionTrie.add(["G"], (n) => {
            const target = n
                ? Math.max(1, Math.min(n, this.cur().lines.length)) - 1
                : this.cur().lines.length - 1;
            return { start: this.pos(), end: { line: target, col: 0 }, kind: "line" };
        });
        this.motionTrie.add(["w"], (n) => this.mkRangeWordForward(n));
        this.motionTrie.add(["}"], (n) => this.mkRangeParagraphForward(n));

        // --- operators (generic operator-pending) ---
        this.operatorTrie.add(["d"], {
            id: "d",
            wantsMotion: true,
            handler: (r, c) => this.doDelete(r, c),
        });
        this.operatorTrie.add(["c"], {
            id: "c",
            wantsMotion: true,
            handler: (r, c) => this.doChange(r, c),
        });
        this.operatorTrie.add(["y"], {
            id: "y",
            wantsMotion: true,
            handler: (r, c) => this.doYank(r, c),
        });
        this.operatorTrie.add([">"], {
            id: ">",
            wantsMotion: true,
            handler: (r, c) => this.doIndent(r, c, +1),
        });
        this.operatorTrie.add(["<"], {
            id: "<",
            wantsMotion: true,
            handler: (r, c) => this.doIndent(r, c, -1),
        });
        this.operatorTrie.add(["="], {
            id: "=",
            wantsMotion: true,
            handler: (r, c) => this.doIndent(r, c, +0 as 1),
        }); // stub: reindent
        this.operatorTrie.add(["g", "~"], {
            id: "g~",
            wantsMotion: true,
            handler: (r, c) => this.doToggleCase(r),
        });
        this.operatorTrie.add(["g", "u"], {
            id: "gu",
            wantsMotion: true,
            handler: (r, c) => this.doLower(r),
        });
        this.operatorTrie.add(["g", "U"], {
            id: "gU",
            wantsMotion: true,
            handler: (r, c) => this.doUpper(r),
        });
    }

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

        this.registerBuiltins();

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

    startVisual(kind: "char" | "line") {
        this.mode = "VISUAL";
        this.vkind = kind;
        this.vAnchor = { line: this.cy, col: this.cx };
        this.render();
    }

    nextVisual() {
        this.mode = "NORMAL";
        this.vkind = null;
        this.vAnchor = null;
        this.render();
    }

    getVisualRange(): Range {
        const a = this.vAnchor ?? { line: this.cy, col: this.cx };
        const b = { line: this.cy, col: this.cx };

        let s = a,
            e = b;
        if (e.line < s.line || (e.line === s.line && e.col === s.col)) [s, e] = [e, s];

        if (this.vkind === "line") {
            return {
                start: { line: s.line, col: 0 },
                end: { line: e.line, col: 0 },
                kind: "line",
            };
        }
        return {
            start: { line: s.line, col: s.col },
            end: { line: e.line, col: e.col },
            kind: "char",
        };
    }

    // --- tiny helpers used by motions/operators ---
    pos(): Pos {
        return { line: this.cy, col: this.cx };
    }
    curLine(): string {
        return this.cur().lines[this.cy] ?? "";
    }
    clampCol(l: number, c: number) {
        return Math.max(0, Math.min(c, (this.cur().lines[l] ?? "").length));
    }
    clampLine(l: number) {
        return Math.max(0, Math.min(l, this.cur().lines.length - 1));
    }

    // Convert a simple movement into a Range (charwise)
    mkRangeMove(n: number, d: { dx: number; dy: number }): Range {
        const start = this.pos();
        let end = { ...start };
        for (let i = 0; i < n; i++) {
            if (d.dy) {
                end.line = this.clampLine(end.line + d.dy);
                end.col = this.clampCol(end.line, end.col);
            }
            if (d.dx) {
                end.col = this.clampCol(end.line, end.col + d.dx);
            }
        }
        return { start, end, kind: "char" };
    }

    mkRangeLine(n: number, delta: number): Range {
        const start = this.pos();
        let line = this.cy;
        for (let i = 0; i < n; i++) {
            line = this.clampLine(line + delta);
        }
        return { start, end: { line, col: 0 }, kind: "line" };
    }

    mkRangeWordForward(n: number): Range {
        const start = this.pos();
        let { line, col } = start;
        const b = this.cur();
        for (let i = 0; i < n; i++) {
            let L = b.lines[line] ?? "";
            if (col < L.length) col++;
            while (col < L.length && /\s/.test(L[col])) col++;
            while (col < L.length && !/\s/.test(L[col])) col++;
            if (col >= L.length && line < b.lines.length - 1) {
                line++;
                col = 0;
                L = b.lines[line] ?? "";
                while (col < L.length && /\s/.test(L[col])) col++;
            }
        }
        return { start, end: { line, col }, kind: "char" };
    }

    mkRangeParagraphForward(n: number): Range {
        const start = this.pos();
        let line = this.cy;
        const b = this.cur();
        for (let i = 0; i < n; i++) {
            while (line < b.lines.length - 1) {
                line++;
                if (/^\s*$/.test(b.lines[line] ?? "")) {
                    line = Math.min(line + 1, b.lines.length - 1);
                    break;
                }
            }
        }
        return { start, end: { line, col: 0 }, kind: "line" };
    }

    normalizeRange(r: Range): { s: Pos; e: Pos } {
        let { start: s, end: e } = r;
        if (e.line < s.line || (e.line === s.line && e.col < s.col)) [s, e] = [e, s];
        return { s, e };
    }

    // --- simple operator implementations ---
    applyDelete(range: Range) {
        const b = this.cur();
        const { s, e } = this.normalizeRange(range);

        if (range.kind === "line") {
            const from = s.line,
                to = e.line;
            const removed = b.lines.splice(from, to - from + 1);
            if (removed.length === 0) return;
            // leave at the start of deletion
            this.cy = Math.min(from, b.lines.length - 1);
            this.cx = 0;
        } else if (s.line === e.line) {
            const L = b.lines[s.line] ?? "";
            b.lines[s.line] = L.slice(0, s.col) + L.slice(e.col);
            this.cy = s.line;
            this.cx = s.col;
        } else {
            const first = b.lines[s.line] ?? "";
            const last = b.lines[e.line] ?? "";
            b.lines.splice(s.line, e.line - s.line + 1, first.slice(0, s.col) + last.slice(e.col));
            this.cy = s.line;
            this.cx = s.col;
        }
        b.dirty = true;
    }

    doDelete(r: Range, count: number): boolean {
        for (let i = 0; i < count; i++) this.applyDelete(r);
        return true;
    }

    doChange(r: Range, count: number): boolean {
        for (let i = 0; i < count; i++) this.applyDelete(r);
        this.mode = "INSERT";
        return true;
    }

    doYank(_r: Range, _count: number): boolean {
        // TODO: put into a register; return false so '.' doesn't repeat yank
        return false;
    }

    doIndent(r: Range, count: number, dir: 1 | -1 = 1): boolean {
        const b = this.cur();
        const { s, e } = this.normalizeRange({ ...r, kind: "line" });
        for (let k = 0; k < count; k++) {
            for (let l = s.line; l <= e.line; l++) {
                const L = b.lines[l] ?? "";
                b.lines[l] = dir > 0 ? "  " + L : L.replace(/^ {1,2}/, "");
            }
        }
        b.dirty = true;
        return true;
    }

    doToggleCase(r: Range): boolean {
        const b = this.cur();
        const { s, e } = this.normalizeRange(r);
        if (r.kind === "line") {
            for (let l = s.line; l <= e.line; l++) {
                b.lines[l] = (b.lines[l] ?? "").replace(/./g, (ch) =>
                    ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                );
            }
        } else if (s.line === e.line) {
            const L = b.lines[s.line] ?? "";
            b.lines[s.line] =
                L.slice(0, s.col) +
                L.slice(s.col, e.col).replace(/./g, (ch) =>
                    ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                ) +
                L.slice(e.col);
        } else {
            // simple multi-line variant
            const first = b.lines[s.line] ?? "";
            const last = b.lines[e.line] ?? "";
            const mid = b.lines
                .slice(s.line + 1, e.line)
                .map((x) =>
                    x.replace(/./g, (ch) =>
                        ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                    )
                );
            const head =
                first.slice(0, s.col) +
                first
                    .slice(s.col)
                    .replace(/./g, (ch) =>
                        ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                    );
            const tail =
                last
                    .slice(0, e.col)
                    .replace(/./g, (ch) =>
                        ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                    ) + last.slice(e.col);
            b.lines.splice(s.line, e.line - s.line + 1, head, ...mid, tail);
        }
        b.dirty = true;
        return true;
    }

    doLower(r: Range): boolean {
        return this.mapCase(r, "lower");
    }
    doUpper(r: Range): boolean {
        return this.mapCase(r, "upper");
    }
    mapCase(r: Range, kind: "lower" | "upper"): boolean {
        const f = (ch: string) => (kind === "lower" ? ch.toLowerCase() : ch.toUpperCase());
        const b = this.cur();
        const { s, e } = this.normalizeRange(r);
        if (r.kind === "line") {
            for (let l = s.line; l <= e.line; l++) b.lines[l] = (b.lines[l] ?? "").replace(/./g, f);
        } else if (s.line === e.line) {
            const L = b.lines[s.line] ?? "";
            b.lines[s.line] =
                L.slice(0, s.col) + L.slice(s.col, e.col).replace(/./g, f) + L.slice(e.col);
        } else {
            const first = b.lines[s.line] ?? "";
            const last = b.lines[e.line] ?? "";
            const mid = b.lines.slice(s.line + 1, e.line).map((x) => x.replace(/./g, f));
            const head = first.slice(0, s.col) + first.slice(s.col).replace(/./g, f);
            const tail = last.slice(0, e.col).replace(/./g, f) + last.slice(e.col);
            b.lines.splice(s.line, e.line - s.line + 1, head, ...mid, tail);
        }
        b.dirty = true;
        return true;
    }

    resetPending() {
        this.pendingCount1 = null;
        this.pendingOp = null;
        this.pendingCount2 = null;
        this.opNode = null;
        this.motionNode = null;
    }

    trieStep<T>(
        node: TrieNode<T> | null,
        key: string,
        root: TrieNode<T>
    ): { kind: "dead" | "more" | "accept" | "acceptOrMore"; node: TrieNode<T> | null; value?: T } {
        const cur = node ?? root;
        const next = cur.next.get(key);
        if (!next) return { kind: "dead", node: null };
        const hasVal = typeof next.val !== "undefined";
        const hasKids = next.next.size > 0;
        if (hasVal && !hasKids) return { kind: "accept", node: next, value: next.val as T };
        if (hasVal && hasKids) return { kind: "acceptOrMore", node: next, value: next.val as T };
        return { kind: "more", node: next };
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
            let content = raw.slice(this.left, this.left + bodyW);

            if (this.mode === "VISUAL" && this.vAnchor) {
                const sel = this.getVisualRange();
                const within =
                    (sel.kind === "line" &&
                        i >= Math.min(sel.start.line, sel.end.line) &&
                        i <= Math.max(sel.start.line, sel.end.line)) ||
                    (sel.kind === "char" &&
                        ((i > sel.start.line && i < sel.end.line) ||
                            (i === sel.start.line &&
                                i === sel.end.line &&
                                sel.start.col !== sel.end.col) ||
                            (i === sel.start.line && i < sel.end.line) ||
                            (i > sel.start.line && i === sel.end.line)));

                if (within) {
                    if (sel.kind === "line") {
                        content = `\x1b[7m${content}\x1b[0m`;
                    } else {
                        let a = 0,
                            b = content.length;
                        if (i === sel.start.line) a = Math.max(0, sel.start.col - this.left);
                        if (i === sel.end.line)
                            b = Math.min(bodyW, Math.max(0, sel.end.col - this.left));
                        a = Math.max(0, Math.min(a, content.length));
                        b = Math.max(0, Math.min(b, content.length));
                        if (b > a) {
                            content =
                                content.slice(0, a) +
                                "\x1b[7m" +
                                content.slice(a, b) +
                                "\x1b[0m" +
                                content.slice(b);
                        }
                    }
                }
            }
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

    onKey(d: string) {
        // arrows
        console.debug("onKey d", d);
        if (d === VIM_CORE_KEYMAP.ArrowUp) {
            this.cy--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.ArrowDown) {
            this.cy++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.ArrowRight) {
            this.cx++;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.ArrowLeft) {
            this.cx--;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }

        if (d === VIM_CORE_KEYMAP.CtrlD) {
            const half = Math.max(1, Math.floor((this.rows - 2) / 2));
            this.cy += half;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.CtrlU) {
            const half = Math.max(1, Math.floor((this.rows - 2) / 2));
            this.cy -= half;
            this.clamp();
            this.ensureVisible();
            return this.render();
        }

        if (this.mode === "INSERT") return this.onInsert(d);
        if (this.mode === "CMDLINE") return this.onCmd(d);
        if (this.mode === "VISUAL") return this.onVisual(d);
        return this.onNormal(d);
    }

    onNormal(d: string) {
        const b = this.cur();

        // ---- immediate controls (not part of op/motion grammar) ----
        if (d === VIM_CORE_KEYMAP.Escape) {
            this.resetPending();
            return;
        }
        if (d === ":") {
            this.resetPending();
            this.mode = "CMDLINE";
            this.cmd = "";
            return this.render();
        }

        if (d === "v") {
            this.resetPending();
            return this.startVisual("char");
        }
        if (d === "V") {
            this.resetPending();
            return this.startVisual("line");
        }

        // insert-mode switches
        if (d === "i") {
            this.resetPending();
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "I") {
            this.resetPending();
            this.cx = 0;
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "a") {
            this.resetPending();
            this.cx++;
            this.clamp();
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "A") {
            this.resetPending();
            this.cx = (b.lines[this.cy] ?? "").length;
            this.mode = "INSERT";
            return this.render();
        }
        if (d === "o") {
            this.resetPending();
            this.newline();
            this.mode = "INSERT";
            this.ensureVisible();
            return this.render();
        }
        if (d === "O") {
            this.resetPending();
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

        const isDigit = (ch: string) => ch >= "0" && ch <= "9";
        if (this.pendingOp == null && isDigit(d)) {
            if (d === "0" && this.pendingCount1 == null) {
            } else {
                const prev = this.pendingCount1 ?? 0;
                this.pendingCount1 = prev * 10 + (d.charCodeAt(0) - 48);
                return;
            }
        }

        let opStep: {
            kind: "dead" | "more" | "accept" | "acceptOrMore";
            node: TrieNode<OperatorSpec> | null;
            value?: OperatorSpec;
        } | null = null;

        let motionStep: {
            kind: "dead" | "more" | "accept" | "acceptOrMore";
            node: TrieNode<MotionFn> | null;
            value?: MotionFn;
        } | null = null;

        if (this.pendingOp == null) {
            opStep = this.trieStep(this.opNode, d, this.operatorTrie.root);
            if (opStep.kind !== "dead") this.opNode = opStep.node;

            motionStep = this.trieStep(this.motionNode, d, this.motionTrie.root);
            if (motionStep.kind !== "dead") this.motionNode = motionStep.node;

            if (opStep.kind === "accept" || opStep.kind === "acceptOrMore") {
                this.pendingOp = opStep.value!;
                if (opStep.kind === "accept") this.motionNode = null;
                return;
            }

            if (
                motionStep.kind === "accept" &&
                (opStep.kind === "dead" || opStep.kind === "more")
            ) {
                const count1 = this.pendingCount1 ?? 1;
                const rng = motionStep.value!(count1);
                this.cy = rng.end.line;
                this.cx = rng.end.col;
                this.clamp();
                this.ensureVisible();
                this.render();
                this.resetPending();
                return;
            }

            if (opStep.kind === "dead" && motionStep.kind === "dead") {
                this.resetPending();
            }
            return;
        }

        if (this.pendingOp) {
            if ((d >= "1" && d <= "9") || (d === "0" && this.pendingCount2 != null)) {
                const prev = this.pendingCount2 ?? 0;
                this.pendingCount2 = prev * 10 + (d.charCodeAt(0) - 48);
                return;
            }

            const mstep = this.trieStep(this.motionNode, d, this.motionTrie.root);
            if (mstep.kind !== "dead") this.motionNode = mstep.node;

            if (mstep.kind === "more") return;

            if (mstep.kind === "accept" || mstep.kind === "acceptOrMore") {
                const motion = mstep.value!;
                const count2 = this.pendingCount2 ?? 1;
                const count1 = this.pendingCount1 ?? 1;

                const rng = motion(count2);
                const changed = this.pendingOp.handler(rng, count1);

                if (changed) {
                    this.lastChange = {
                        op: this.pendingOp.id,
                        count1,
                        count2,
                        motionSeq: [],
                    };
                }
                this.ensureVisible();
                this.render();
                this.resetPending();
                return;
            }

            this.resetPending();
            return;
        }
    }

    onInsert(d: string) {
        if (d === VIM_CORE_KEYMAP.Escape) {
            this.mode = "NORMAL";
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.Enter_CR || d === VIM_CORE_KEYMAP.Enter_LF) {
            this.newline();
            this.ensureVisible();
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.Backspace || d === VIM_CORE_KEYMAP.Backspace2) {
            this.backspace();
            this.ensureVisible();
            return this.render();
        }
        if (d >= " " && d !== VIM_CORE_KEYMAP.Backspace) {
            this.pushChar(d);
            this.ensureVisible();
            return this.render();
        }
    }

    onCmd(d: string) {
        if (d === VIM_CORE_KEYMAP.Escape) {
            this.mode = "NORMAL";
            this.cmd = "";
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.Backspace || d === VIM_CORE_KEYMAP.Backspace2) {
            this.cmd = this.cmd.slice(0, -1);
            return this.render();
        }
        if (d === VIM_CORE_KEYMAP.Enter_CR || d === VIM_CORE_KEYMAP.Enter_LF) {
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

    onVisual(d: string) {
        const b = this.cur();
        const line = b.lines[this.cy] ?? "";

        // exit / toggle kinds
        if (d === VIM_CORE_KEYMAP.Escape) return (this.mode = "NORMAL");
        if (d === "v") {
            // toggle charwise
            if (this.vkind === "char") return (this.mode = "NORMAL");
            this.vkind = "char";
            return this.render();
        }
        if (d === "V") {
            // toggle linewise
            if (this.vkind === "line") return (this.mode = "NORMAL");
            this.vkind = "line";
            return this.render();
        }

        // motions (same as Normal, but keep anchor)
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

        // apply common operators directly to the selection
        const applySel = (fn: (r: Range, count: number) => boolean) => {
            const r = this.getVisualRange();
            const changed = fn(r, 1);
            if (changed) {
                this.ensureVisible();
            }
            // Leave visual mode after action (Vim does)
            if (this.mode === "VISUAL") return (this.mode = "NORMAL");
            else this.render();
        };

        if (d === "d") return applySel((r, c) => this.doDelete(r, c));
        if (d === "c") return applySel((r, c) => this.doChange(r, c));
        if (d === "y") return applySel((r, c) => this.doYank(r, c));
        if (d === ">") return applySel((r, c) => this.doIndent(r, c, +1));
        if (d === "<") return applySel((r, c) => this.doIndent(r, c, -1));
        if (d === "=") return applySel((r, c) => this.doIndent(r, c, +0 as 1));

        // ignore everything else
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
