import { Button, Row } from "@react-email/components";
import { useEffect, useReducer, useRef, useState } from "react";

const gridSize = 4;
const TARGET_TILE = 2048;

/*---- Helper ----- */
function drawEmptyBoard() {
    return Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
}

function spawnTile(board: number[][]): number[][] {
    const emptyCells: { x: number; y: number }[] = [];
    board.forEach((row, y) =>
        row.forEach((val, x) => {
            if (val === 0) emptyCells.push({ x, y });
        })
    );
    if (emptyCells.length === 0) return board;

    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map((row) => [...row]);
    newBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
}

const transpose = (m: number[][]): number[][] => m[0].map((_, c) => m.map((row) => row[c]));

const boardsEqual = (a: number[][], b: number[][]) => JSON.stringify(a) === JSON.stringify(b);

function processRowLeftScore(row: number[]) {
    const tiles = row.filter((v) => v !== 0);
    const out: number[] = [];
    let gained = 0;
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === tiles[i + 1]) {
            const merged = tiles[i] * 2;
            out.push(merged);
            gained += merged;
            i++;
        } else {
            out.push(tiles[i]);
        }
    }
    while (out.length < row.length) out.push(0);
    return { row: out, gained };
}

const processRowLeft = (row: number[]) => processRowLeftScore(row).row;

function moveLeft(b: number[][]) {
    let gained = 0;
    const board = b.map((r) => {
        const res = processRowLeftScore([...r]);
        gained += res.gained;
        return res.row;
    });
    return { board, gained };
}

function moveRight(b: number[][]) {
    let gained = 0;
    const board = b.map((r) => {
        const res = processRowLeftScore([...r].reverse());
        gained += res.gained;
        return res.row.reverse();
    });
    return { board, gained };
}

function moveUp(b: number[][]) {
    const t = transpose(b);
    const res = moveLeft(t);
    return { board: transpose(res.board), gained: res.gained };
}

function moveDown(b: number[][]) {
    const t = transpose(b);
    const res = moveRight(t);
    return { board: transpose(res.board), gained: res.gained };
}

const nextLeft = (b: number[][]) => b.map((r) => processRowLeft([...r]));
const nextRight = (b: number[][]) => b.map((r) => processRowLeft([...r].reverse()).reverse());
const nextUp = (b: number[][]) => transpose(nextLeft(transpose(b)));
const nextDown = (b: number[][]) => transpose(nextRight(transpose(b)));

const checkFullBoard = (b: number[][]) =>
    boardsEqual(nextLeft(b), b) &&
    boardsEqual(nextRight(b), b) &&
    boardsEqual(nextUp(b), b) &&
    boardsEqual(nextDown(b), b);

const hasWon = (b: number[][], target = TARGET_TILE) =>
    b.some((row) => row.some((v) => v >= target));

/*---- Reducer ----*/

type DIR = "LEFT" | "RIGHT" | "UP" | "DOWN";
type GameState = "Start" | "InProgress" | "GameOver" | "Won";

type State = {
    board: number[][];
    score: number;
    gameState: GameState;
};

type Action =
    | { type: "START" }
    | { type: "MOVE"; dir: DIR }
    | { type: "RESET" }
    | { type: "CONTINUE" };

function initialState(): State {
    return {
        board: drawEmptyBoard(),
        score: 0,
        gameState: "Start",
    };
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "START": {
            const seeded = spawnTile(spawnTile(drawEmptyBoard()));
            return { board: seeded, score: 0, gameState: "InProgress" };
        }
        case "RESET": {
            return initialState();
        }
        case "CONTINUE": {
            if (state.gameState !== "Won") return state;
            return { ...state, gameState: "InProgress" };
        }
        case "MOVE": {
            if (state.gameState !== "InProgress") return state;

            const mover =
                action.dir === "LEFT"
                    ? moveLeft
                    : action.dir === "RIGHT"
                      ? moveRight
                      : action.dir === "UP"
                        ? moveUp
                        : moveDown;

            const { board: moved, gained } = mover(state.board);
            if (boardsEqual(moved, state.board)) return state;

            const withTile = spawnTile(moved);

            const won = hasWon(withTile);
            const over = !won && checkFullBoard(withTile);

            return {
                board: withTile,
                score: state.score + gained,
                gameState: won ? "Won" : over ? "GameOver" : "InProgress",
            };
        }
        default:
            return state;
    }
}

export const SwitcheruGameBecauseNamingConventions = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [state, dispatch] = useReducer(reducer, undefined, initialState);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const padding = 4;
        const width = canvas.width - padding * 2;
        const height = canvas.height - padding * 2;
        const cellSize = Math.min(width, height) / gridSize;

        if (state.gameState === "Start") {
            ctx.fillStyle = "#f4e4c0";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const size = 120;
            const x = canvas.width / 2 - size / 2;
            const y = canvas.height / 4 - size / 2;
            const depth = 25;

            ctx.fillStyle = "#edcf72";
            ctx.beginPath();
            ctx.rect(x, y, size, size);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#f59563";
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x + size + depth, y - depth);
            ctx.lineTo(x + size + depth, y + size - depth);
            ctx.lineTo(x + size, y + size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ede0c8";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + depth, y - depth);
            ctx.lineTo(x + size + depth, y - depth);
            ctx.lineTo(x + size, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.font = "32px Chunky Beard";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("2048", canvas.width / 2, canvas.height / 4);

            ctx.font = "24px Arial";
            ctx.fillText("Press ENTER to Start", canvas.width / 2, canvas.height / 1.5);
            return;
        }

        if (state.gameState === "GameOver") {
            ctx.fillStyle = "red";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
            ctx.font = "24px Arial";
            ctx.fillText("Press R or Enter to Restart", canvas.width / 2, canvas.height / 2 + 40);
            return;
        }

        if (state.gameState === "Won") {
            ctx.fillStyle = "green";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("You Win!", canvas.width / 2, canvas.height / 2);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "lightblue";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gridPx = cellSize * gridSize;
        const gridRect = { x: padding, y: padding, w: gridPx, h: gridPx };

        const margin = Math.max(8, Math.floor(Math.min(canvas.width, canvas.height) * 0.02));
        const minBtnW = 96;
        const minBtnH = 56;

        let btn = null;

        const rightSpace = canvas.width - (gridRect.x + gridRect.w) - margin;
        if (rightSpace >= minBtnW + margin) {
            const w = Math.min(
                rightSpace - margin,
                Math.max(minBtnW, Math.floor(canvas.width * 0.24))
            );
            const h = Math.min(gridRect.h, Math.max(minBtnH, Math.floor(w * 0.6)));
            btn = { x: gridRect.x + gridRect.w + margin, y: gridRect.y, w, h };
        }

        if (!btn) {
            const available = gridRect.y - margin;
            if (available >= minBtnH) {
                const w = gridRect.w;
                const h = Math.min(available, Math.max(minBtnH, Math.floor(canvas.height * 0.14)));
                btn = { x: gridRect.x, y: gridRect.y - h - margin, w, h };
            }
        }

        if (!btn) {
            const available = canvas.height - (gridRect.y + gridRect.h) - margin;
            if (available >= minBtnH) {
                const w = gridRect.w;
                const h = Math.min(available, Math.max(minBtnH, Math.floor(canvas.height * 0.14)));
                btn = { x: gridRect.x, y: gridRect.y + gridRect.h + margin, w, h };
            }
        }

        if (!btn) {
            const w = Math.max(minBtnW, Math.floor(canvas.width * 0.24));
            const h = Math.max(minBtnH, Math.floor(w * 0.6));
            btn = { x: canvas.width - w - margin, y: margin, w, h };
        }

        ctx.save();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);

        const titleSize = Math.max(14, Math.floor(btn.h * 0.32));
        const scoreSize = Math.max(18, Math.floor(btn.h * 0.4));

        ctx.fillStyle = "black";
        ctx.textAlign = "center";

        ctx.textBaseline = "alphabetic";
        ctx.font = `${titleSize}px Arial`;
        ctx.fillText("Score", btn.x + btn.w / 2, btn.y + btn.h * 0.45);

        ctx.textBaseline = "top";
        ctx.font = `700 ${scoreSize}px Arial`;
        ctx.fillText(String(state.score), btn.x + btn.w / 2, btn.y + btn.h * 0.52);
        ctx.restore();

        state.board.forEach((row, gy) => {
            row.forEach((val, gx) => {
                const cellX = padding + gx * cellSize;
                const cellY = padding + gy * cellSize;

                ctx.strokeStyle = "black";
                ctx.strokeRect(cellX, cellY, cellSize, cellSize);

                if (val > 0) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(
                        cellX + padding / 2,
                        cellY + padding / 2,
                        cellSize - padding,
                        cellSize - padding
                    );

                    ctx.fillStyle = "black";
                    ctx.font = `${cellSize / 2}px Arial`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(val.toString(), cellX + cellSize / 2, cellY + cellSize / 2);
                }
            });
        });
    }, [
        canvasRef?.current?.clientHeight,
        canvasRef?.current?.clientWidth,
        state.board,
        state.gameState,
        state.score,
        gridSize,
    ]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Enter": {
                    if (state.gameState !== "Start" && state.gameState !== "GameOver") return;
                    return dispatch({ type: "START" });
                }
                case "R": {
                    if (state.gameState !== "GameOver") return;
                    return dispatch({ type: "START" });
                }
                case "r": {
                    if (state.gameState !== "GameOver") return;
                    return dispatch({ type: "START" });
                }

                case "ArrowUp": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "UP" });
                }
                case "ArrowDown": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "DOWN" });
                }
                case "ArrowLeft": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "LEFT" });
                }
                case "ArrowRight": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "RIGHT" });
                }
                case "W": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "UP" });
                }
                case "w": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "UP" });
                }
                case "S": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "DOWN" });
                }
                case "s": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "DOWN" });
                }
                case "A": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "LEFT" });
                }
                case "a": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "LEFT" });
                }
                case "D": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "RIGHT" });
                }
                case "d": {
                    if (state.gameState !== "InProgress") return;
                    return dispatch({ type: "MOVE", dir: "RIGHT" });
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state.gameState]);

    return (
        <div className="h-full w-full">
            <canvas id="2048Game" ref={canvasRef} className="mb-[40px] h-full w-full"></canvas>
        </div>
    );
};
