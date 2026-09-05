import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  Dispatch,
  PointerEvent,
  SetStateAction,
  WheelEvent,
} from "react";
import { RoomTemplate } from "../../scenes/RoomTemplate";
import {
  EditorSelection,
  RoomTool,
} from "./types/RoomEditorState";
import { DECOR_ASSETS, decorationSize } from "../../objects/Decoration";
import { AssetPool } from "../../sprites/AssetPool";

import wallSheetUrl from "../../assets/environment/Dungeon_1/Dungeon_1.png";
import pillarSheetUrl from "../../assets/environment/Dungeon_1/Dungeon_1_Pillars.png";
import waterSheetUrl from "../../assets/environment/Dungeon_1/Dungeon_1_Sewer_Tileset.png";

const WALL_SHEET = "dungeon/tileset";
const PILLAR_SHEET = "dungeon/pillars";
const WATER_SHEET = "dungeon/water";
const TILE = 16;

interface RoomCanvasProps {
  room: RoomTemplate;
  setRoom: Dispatch<SetStateAction<RoomTemplate>>;
  tool: RoomTool;
  selected: EditorSelection;
  setSelected: Dispatch<SetStateAction<EditorSelection>>;
  decorKind: string;
}

const GRID = 20;
const PILLAR_W = 32;
const PILLAR_H = 48;
const CHEST_SIZE = 48;
const PAN_SPEED = 8;

export const RoomCanvas = ({
  room,
  setRoom,
  tool,
  selected,
  setSelected,
  decorKind,
}: RoomCanvasProps) => {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({
    x: 40,
    y: 40,
  });

  const [wallPreview, setWallPreview] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const [rectPreview, setRectPreview] =
    useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

  const [showGraphics, setShowGraphics] =
    useState(false);

  const [assetsReady, setAssetsReady] =
    useState(false);

  useEffect(() => {
    if (!showGraphics || assetsReady) {
      return;
    }

    let cancelled = false;

    AssetPool.loadAll([
      { path: WALL_SHEET, url: wallSheetUrl },
      { path: PILLAR_SHEET, url: pillarSheetUrl },
      { path: WATER_SHEET, url: waterSheetUrl },
      ...Object.values(DECOR_ASSETS).map((asset) => ({
        path: asset.path,
        url: asset.url,
      })),
    ]).then(() => {
      if (!cancelled) {
        setAssetsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showGraphics, assetsReady]);

  const dragRef = useRef<{
    type: "pan" | "move";
    startX: number;
    startY: number;
    originalX?: number;
    originalY?: number;
  } | null>(null);

  const wallDragRef = useRef<{
    startX: number;
    startY: number;
  } | null>(null);

  const rectDragRef = useRef<{
    startX: number;
    startY: number;
  } | null>(null);

  const keysRef = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const decorations = room.decorations ?? [];
  const floorRegions = room.floorRegions ?? [];
  const waterRegions = room.waterRegions ?? [];

  /** floor/water regions are edited the same way — just different fields. */
  const rectField = (
    kind: "floor" | "water",
  ): "floorRegions" | "waterRegions" =>
    kind === "floor" ? "floorRegions" : "waterRegions";

  const snap = (value: number) =>
    Math.round(value / GRID) * GRID;

  const worldToScreen = useCallback(
    (x: number, y: number) => ({
      x: pan.x + x * zoom,
      y: pan.y + y * zoom,
    }),
    [pan, zoom],
  );

  const screenToWorld = useCallback(
    (x: number, y: number) => ({
      x: (x - pan.x) / zoom,
      y: (y - pan.y) / zoom,
    }),
    [pan, zoom],
  );

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    ctx.save();

    const startX =
      Math.floor(
        (-pan.x / zoom) / GRID,
      ) * GRID;

    const endX =
      Math.ceil(
        ((width - pan.x) / zoom) / GRID,
      ) * GRID;

    const startY =
      Math.floor(
        (-pan.y / zoom) / GRID,
      ) * GRID;

    const endY =
      Math.ceil(
        ((height - pan.y) / zoom) / GRID,
      ) * GRID;

    ctx.strokeStyle =
      "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;

    for (
      let x = startX;
      x <= endX;
      x += GRID
    ) {
      const sx =
        pan.x + x * zoom;

      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }

    for (
      let y = startY;
      y <= endY;
      y += GRID
    ) {
      const sy =
        pan.y + y * zoom;

      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    ctx.restore();
  };

  const graphicsOn = showGraphics && assetsReady;

  /** Same 9-slice frame WorldScene uses, so a preview pool looks like the real one. */
  const waterTileAt = (
    region: { x: number; y: number; width: number; height: number },
    wx: number,
    wy: number,
  ): [number, number] => {
    const col = Math.round((wx - region.x) / TILE);
    const row = Math.round((wy - region.y) / TILE);
    const lastCol = Math.max(0, Math.round(region.width / TILE) - 1);
    const lastRow = Math.max(0, Math.round(region.height / TILE) - 1);

    const atLeft = col <= 0;
    const atRight = col >= lastCol;
    const atTop = row <= 0;
    const atBottom = row >= lastRow;

    if (atTop && atLeft) return [9, 1];
    if (atTop && atRight) return [11, 1];
    if (atBottom && atLeft) return [9, 3];
    if (atBottom && atRight) return [11, 3];
    if (atTop) return [10, 1];
    if (atBottom) return [10, 3];
    if (atLeft) return [9, 2];
    if (atRight) return [11, 2];
    return [10, 2];
  };

  /** Tiles a 16×16-cell image across a room-space rect, at the current zoom/pan. */
  const drawTiledRegion = (
    ctx: CanvasRenderingContext2D,
    image: CanvasImageSource,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    pickTile: (worldX: number, worldY: number) => [number, number],
  ) => {
    for (let ty = 0; ty < rh; ty += TILE) {
      for (let tx = 0; tx < rw; tx += TILE) {
        const dw = Math.min(TILE, rw - tx);
        const dh = Math.min(TILE, rh - ty);
        const p = worldToScreen(rx + tx, ry + ty);
        const [sc, sr] = pickTile(rx + tx, ry + ty);

        ctx.drawImage(
          image,
          sc * TILE,
          sr * TILE,
          dw,
          dh,
          p.x,
          p.y,
          dw * zoom,
          dh * zoom,
        );
      }
    }
  };

  const drawRoom = (
    ctx: CanvasRenderingContext2D,
  ) => {
    const topLeft =
      worldToScreen(0, 0);

    const roomWidth =
      room.width * zoom;

    const roomHeight =
      room.height * zoom;

    ctx.fillStyle = "#171720";

    ctx.fillRect(
      topLeft.x,
      topLeft.y,
      roomWidth,
      roomHeight,
    );

    ctx.save();

    ctx.beginPath();

    ctx.rect(
      topLeft.x,
      topLeft.y,
      roomWidth,
      roomHeight,
    );

    ctx.clip();

    ctx.strokeStyle =
      "rgba(255,255,255,0.07)";

    ctx.lineWidth = 1;

    const startX =
      Math.floor(
        (-pan.x / zoom) / GRID,
      ) * GRID;

    const endX =
      Math.ceil(
        ((topLeft.x + roomWidth - pan.x) /
          zoom),
      ) * GRID;

    const startY =
      Math.floor(
        (-pan.y / zoom) / GRID,
      ) * GRID;

    const endY =
      Math.ceil(
        ((topLeft.y + roomHeight - pan.y) /
          zoom),
      ) * GRID;

    for (
      let x = startX;
      x <= endX;
      x += GRID
    ) {
      const sx =
        pan.x + x * zoom;

      ctx.beginPath();
      ctx.moveTo(sx, topLeft.y);
      ctx.lineTo(
        sx,
        topLeft.y + roomHeight,
      );
      ctx.stroke();
    }

    for (
      let y = startY;
      y <= endY;
      y += GRID
    ) {
      const sy =
        pan.y + y * zoom;

      ctx.beginPath();
      ctx.moveTo(topLeft.x, sy);
      ctx.lineTo(
        topLeft.x + roomWidth,
        sy,
      );
      ctx.stroke();
    }

    ctx.restore();

    ctx.strokeStyle =
      "rgba(255,255,255,0.25)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
      topLeft.x,
      topLeft.y,
      roomWidth,
      roomHeight,
    );

    // Floor/water regions are drawn first so walls, pillars, chests etc.
    // paint over them — they mark which part of the rectangle is actually
    // floor. If none are set, the whole room counts as floor (the default
    // for an ordinary room); once you add one, only these rects are floor,
    // which is how a corridor's cross shape (rest = void) is built.
    if (graphicsOn) {
      const floorSheet = AssetPool.getImage(WALL_SHEET);

      if (floorSheet !== null) {
        const floorAreas =
          floorRegions.length > 0
            ? floorRegions
            : [{ x: 0, y: 0, width: room.width, height: room.height }];

        for (const area of floorAreas) {
          drawTiledRegion(
            ctx,
            floorSheet,
            area.x,
            area.y,
            area.width,
            area.height,
            () => [4, 7],
          );
        }
      }
    }

    floorRegions.forEach((region, i) => {
      const p = worldToScreen(region.x, region.y);
      const w = region.width * zoom;
      const h = region.height * zoom;
      const isSelected =
        selected.type === "floor" && selected.index === i;

      if (!graphicsOn) {
        ctx.fillStyle = isSelected
          ? "rgba(90,110,140,0.55)"
          : "rgba(70,80,100,0.4)";
        ctx.fillRect(p.x, p.y, w, h);
      }

      ctx.strokeStyle = isSelected
        ? "#a8c0ff"
        : "rgba(160,180,220,0.35)";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, w - 1, h - 1);
    });

    if (graphicsOn) {
      const waterSheet = AssetPool.getImage(WATER_SHEET);

      if (waterSheet !== null) {
        for (const region of waterRegions) {
          drawTiledRegion(
            ctx,
            waterSheet,
            region.x,
            region.y,
            region.width,
            region.height,
            (wx, wy) => waterTileAt(region, wx, wy),
          );
        }
      }
    }

    waterRegions.forEach((region, i) => {
      const p = worldToScreen(region.x, region.y);
      const w = region.width * zoom;
      const h = region.height * zoom;
      const isSelected =
        selected.type === "water" && selected.index === i;

      if (!graphicsOn) {
        ctx.fillStyle = isSelected
          ? "rgba(60,180,190,0.6)"
          : "rgba(40,150,160,0.45)";
        ctx.fillRect(p.x, p.y, w, h);
      }

      ctx.strokeStyle = isSelected
        ? "#8affe0"
        : "rgba(90,220,210,0.4)";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, w - 1, h - 1);
    });

    if (rectPreview) {
      const p = worldToScreen(rectPreview.x, rectPreview.y);
      const w = rectPreview.width * zoom;
      const h = rectPreview.height * zoom;

      ctx.fillStyle =
        tool === "water"
          ? "rgba(90,220,210,0.35)"
          : "rgba(160,180,220,0.35)";
      ctx.fillRect(p.x, p.y, w, h);

      ctx.strokeStyle = "#a8c0ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, w - 1, h - 1);
      ctx.setLineDash([]);
    }

    room.walls.forEach((wall, i) => {
      const p = worldToScreen(
        wall.x,
        wall.y,
      );

      const w =
        wall.width * zoom;

      const h =
        wall.height * zoom;

      const isSelected =
        selected.type === "wall" &&
        selected.index === i;

      const wallSheet = graphicsOn
        ? AssetPool.getImage(WALL_SHEET)
        : null;

      if (wallSheet !== null) {
        drawTiledRegion(
          ctx,
          wallSheet,
          wall.x,
          wall.y,
          wall.width,
          wall.height,
          () => [10, 1],
        );
      } else {
        ctx.fillStyle = isSelected
          ? "rgba(80,220,160,0.85)"
          : "rgba(100,100,115,0.95)";

        ctx.fillRect(
          p.x,
          p.y,
          w,
          h,
        );
      }

      ctx.strokeStyle = isSelected
        ? "#70ffc0"
        : "rgba(255,255,255,0.18)";

      ctx.lineWidth =
        isSelected ? 2 : 1;

      ctx.strokeRect(
        p.x + 0.5,
        p.y + 0.5,
        w - 1,
        h - 1,
      );
    });

    if (wallPreview) {
      const p = worldToScreen(
        wallPreview.x,
        wallPreview.y,
      );

      const w =
        wallPreview.width * zoom;

      const h =
        wallPreview.height * zoom;

      ctx.fillStyle =
        "rgba(112,255,192,0.35)";

      ctx.fillRect(
        p.x,
        p.y,
        w,
        h,
      );

      ctx.strokeStyle =
        "#70ffc0";

      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      ctx.strokeRect(
        p.x + 0.5,
        p.y + 0.5,
        w - 1,
        h - 1,
      );

      ctx.setLineDash([]);
    }

    room.pillars.forEach(
      (pillar, i) => {
        const p = worldToScreen(
          pillar.x,
          pillar.y,
        );

        const w =
          PILLAR_W * zoom;

        const h =
          PILLAR_H * zoom;

        const isSelected =
          selected.type === "pillar" &&
          selected.index === i;

        const pillarSheet = graphicsOn
          ? AssetPool.getImage(PILLAR_SHEET)
          : null;

        if (pillarSheet !== null) {
          const variant = pillar.variant ?? 0;

          ctx.drawImage(
            pillarSheet,
            variant * 16,
            0,
            16,
            48,
            p.x,
            p.y,
            w,
            h,
          );
        } else {
          ctx.fillStyle = isSelected
            ? "rgba(210,170,80,0.95)"
            : "rgba(130,105,65,0.95)";

          ctx.fillRect(
            p.x,
            p.y,
            w,
            h,
          );

          ctx.fillStyle =
            "rgba(255,255,255,0.25)";

          ctx.beginPath();

          ctx.arc(
            p.x + w / 2,
            p.y + h / 2,
            3,
            0,
            Math.PI * 2,
          );

          ctx.fill();
        }

        ctx.strokeStyle =
          isSelected
            ? "#ffe08a"
            : "rgba(255,255,255,0.2)";

        ctx.lineWidth =
          isSelected ? 2 : 1;

        ctx.strokeRect(
          p.x + 0.5,
          p.y + 0.5,
          w - 1,
          h - 1,
        );
      },
    );

    room.chestSpots.forEach(
      (chest, i) => {
        const p = worldToScreen(
          chest.x,
          chest.y,
        );

        const size =
          CHEST_SIZE * zoom;

        const isSelected =
          selected.type === "chest" &&
          selected.index === i;

        ctx.fillStyle = isSelected
          ? "rgba(180,100,255,0.9)"
          : "rgba(125,70,190,0.8)";

        ctx.fillRect(
          p.x,
          p.y,
          size,
          size,
        );

        ctx.strokeStyle =
          isSelected
            ? "#d9a8ff"
            : "rgba(255,255,255,0.2)";

        ctx.lineWidth =
          isSelected ? 2 : 1;

        ctx.strokeRect(
          p.x + 0.5,
          p.y + 0.5,
          size - 1,
          size - 1,
        );

        ctx.strokeStyle =
          "rgba(255,255,255,0.5)";

        ctx.lineWidth = 1;

        ctx.beginPath();

        ctx.moveTo(
          p.x + size / 2,
          p.y + size * 0.2,
        );

        ctx.lineTo(
          p.x + size / 2,
          p.y + size * 0.8,
        );

        ctx.moveTo(
          p.x + size * 0.2,
          p.y + size / 2,
        );

        ctx.lineTo(
          p.x + size * 0.8,
          p.y + size / 2,
        );

        ctx.stroke();
      },
    );

    decorations.forEach((decoration, i) => {
      const { width: dw, height: dh } = decorationSize(
        decoration.kind,
        decoration.scale,
      );

      const p = worldToScreen(
        decoration.x - dw / 2,
        decoration.y - dh / 2,
      );

      const w = dw * zoom;
      const h = dh * zoom;

      const isSelected =
        selected.type === "decoration" &&
        selected.index === i;

      const asset = graphicsOn
        ? DECOR_ASSETS[decoration.kind]
        : undefined;

      const image = asset
        ? AssetPool.getImage(asset.path)
        : null;

      if (asset && image !== null) {
        ctx.save();
        ctx.translate(p.x + w / 2, p.y + h / 2);
        ctx.rotate(
          ((decoration.rotation ?? 0) * Math.PI) / 180,
        );
        ctx.drawImage(
          image,
          asset.sx,
          asset.sy,
          asset.sw,
          asset.sh,
          -w / 2,
          -h / 2,
          w,
          h,
        );
        ctx.restore();
      } else {
        ctx.fillStyle = isSelected
          ? "rgba(90,220,190,0.9)"
          : "rgba(60,150,130,0.75)";

        ctx.fillRect(p.x, p.y, w, h);

        if (zoom > 0.4) {
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.font = "9px monospace";
          ctx.fillText(decoration.kind, p.x + 2, p.y + 10);
        }
      }

      ctx.strokeStyle = isSelected
        ? "#8affe0"
        : "rgba(255,255,255,0.2)";

      ctx.lineWidth = isSelected ? 2 : 1;

      ctx.strokeRect(
        p.x + 0.5,
        p.y + 0.5,
        w - 1,
        h - 1,
      );
    });

    const doorWidth =
      room.doorWidth;

    const doorThickness =
      room.wallThickness;

    const drawDoor = (
      direction:
        | "N"
        | "S"
        | "E"
        | "W",
    ) => {
      let x = 0;
      let y = 0;
      let w = 0;
      let h = 0;

      switch (direction) {
        case "N":
          x =
            (room.width -
              doorWidth) /
            2;
          y = 0;
          w = doorWidth;
          h = doorThickness;
          break;

        case "S":
          x =
            (room.width -
              doorWidth) /
            2;
          y =
            room.height -
            doorThickness;
          w = doorWidth;
          h = doorThickness;
          break;

        case "W":
          x = 0;
          y =
            (room.height -
              doorWidth) /
            2;
          w = doorThickness;
          h = doorWidth;
          break;

        case "E":
          x =
            room.width -
            doorThickness;
          y =
            (room.height -
              doorWidth) /
            2;
          w = doorThickness;
          h = doorWidth;
          break;
      }

      const p = worldToScreen(
        x,
        y,
      );

      ctx.fillStyle =
        "rgba(70,190,255,0.3)";

      ctx.fillRect(
        p.x,
        p.y,
        w * zoom,
        h * zoom,
      );

      ctx.strokeStyle =
        "rgba(70,190,255,0.8)";

      ctx.lineWidth = 2;

      ctx.strokeRect(
        p.x,
        p.y,
        w * zoom,
        h * zoom,
      );
    };

    for (const door of room.doors) {
      drawDoor(door);
    }

    const center =
      worldToScreen(
        room.width / 2,
        room.height / 2,
      );

    ctx.strokeStyle =
      "rgba(255,255,255,0.12)";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      center.x - 8,
      center.y,
    );

    ctx.lineTo(
      center.x + 8,
      center.y,
    );

    ctx.moveTo(
      center.x,
      center.y - 8,
    );

    ctx.lineTo(
      center.x,
      center.y + 8,
    );

    ctx.stroke();
  };

  const render = useCallback(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const dpr =
      window.devicePixelRatio || 1;

    const width = rect.width;
    const height = rect.height;

    canvas.width =
      width * dpr;

    canvas.height =
      height * dpr;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0,
    );

    ctx.clearRect(
      0,
      0,
      width,
      height,
    );

    ctx.fillStyle = "#0c0c12";

    ctx.fillRect(
      0,
      0,
      width,
      height,
    );

    drawGrid(
      ctx,
      width,
      height,
    );

    drawRoom(ctx);

    if (
      selected.type === "wall" &&
      selected.index >= 0
    ) {
      const wall =
        room.walls[selected.index];

      if (wall) {
        const p =
          worldToScreen(
            wall.x,
            wall.y,
          );

        const w =
          wall.width * zoom;

        const h =
          wall.height * zoom;

        ctx.fillStyle =
          "#70ffc0";

        ctx.fillRect(
          p.x + w - 5,
          p.y + h - 5,
          10,
          10,
        );
      }
    }

    ctx.fillStyle =
      "rgba(255,255,255,0.45)";

    ctx.font =
      "11px monospace";

    ctx.fillText(
      `${room.width} × ${room.height}`,
      12,
      height - 12,
    );
  }, [
    room,
    selected,
    zoom,
    pan,
    wallPreview,
    rectPreview,
    showGraphics,
    assetsReady,
    drawGrid,
    drawRoom,
    worldToScreen,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const observer =
      new ResizeObserver(() => {
        render();
      });

    observer.observe(canvas);

    return () =>
      observer.disconnect();
  }, [render]);

  const hitTest = (
    worldX: number,
    worldY: number,
  ): EditorSelection => {
    for (
      let i = room.walls.length - 1;
      i >= 0;
      i--
    ) {
      const wall =
        room.walls[i];

      if (
        worldX >= wall.x &&
        worldX <=
          wall.x + wall.width &&
        worldY >= wall.y &&
        worldY <=
          wall.y + wall.height
      ) {
        return {
          type: "wall",
          index: i,
        };
      }
    }

    for (
      let i = room.pillars.length - 1;
      i >= 0;
      i--
    ) {
      const pillar =
        room.pillars[i];

      if (
        worldX >= pillar.x &&
        worldX <=
          pillar.x + PILLAR_W &&
        worldY >= pillar.y &&
        worldY <=
          pillar.y + PILLAR_H
      ) {
        return {
          type: "pillar",
          index: i,
        };
      }
    }

    for (
      let i =
        room.chestSpots.length - 1;
      i >= 0;
      i--
    ) {
      const chest =
        room.chestSpots[i];

      if (
        worldX >= chest.x &&
        worldX <=
          chest.x + CHEST_SIZE &&
        worldY >= chest.y &&
        worldY <=
          chest.y + CHEST_SIZE
      ) {
        return {
          type: "chest",
          index: i,
        };
      }
    }

    for (
      let i = decorations.length - 1;
      i >= 0;
      i--
    ) {
      const decoration = decorations[i];

      const { width: dw, height: dh } =
        decorationSize(decoration.kind, decoration.scale);

      if (
        worldX >= decoration.x - dw / 2 &&
        worldX <= decoration.x + dw / 2 &&
        worldY >= decoration.y - dh / 2 &&
        worldY <= decoration.y + dh / 2
      ) {
        return {
          type: "decoration",
          index: i,
        };
      }
    }

    for (let i = waterRegions.length - 1; i >= 0; i--) {
      const region = waterRegions[i];

      if (
        worldX >= region.x &&
        worldX <= region.x + region.width &&
        worldY >= region.y &&
        worldY <= region.y + region.height
      ) {
        return { type: "water", index: i };
      }
    }

    for (let i = floorRegions.length - 1; i >= 0; i--) {
      const region = floorRegions[i];

      if (
        worldX >= region.x &&
        worldX <= region.x + region.width &&
        worldY >= region.y &&
        worldY <= region.y + region.height
      ) {
        return { type: "floor", index: i };
      }
    }

    return {
      type: null,
      index: -1,
    };
  };

  const addPillar = (
    x: number,
    y: number,
  ) => {
    setRoom((prev) => ({
      ...prev,
      pillars: [
        ...prev.pillars,
        {
          x: snap(x),
          y: snap(y),
          variant: 0,
        },
      ],
    }));

    setSelected({
      type: "pillar",
      index: room.pillars.length,
    });
  };

  const addChest = (
    x: number,
    y: number,
  ) => {
    setRoom((prev) => ({
      ...prev,
      chestSpots: [
        ...prev.chestSpots,
        {
          x: snap(x),
          y: snap(y),
        },
      ],
    }));

    setSelected({
      type: "chest",
      index: room.chestSpots.length,
    });
  };

  const addDecoration = (
    x: number,
    y: number,
  ) => {
    setRoom((prev) => ({
      ...prev,
      decorations: [
        ...(prev.decorations ?? []),
        {
          x: snap(x),
          y: snap(y),
          kind: decorKind,
          scale: 1,
        },
      ],
    }));

    setSelected({
      type: "decoration",
      index: decorations.length,
    });
  };

  const removeSelected = () => {
    if (
      selected.type === null ||
      selected.index < 0
    ) {
      return;
    }

    setRoom((prev) => {
      const next = {
        ...prev,
        walls: [...prev.walls],
        pillars: [...prev.pillars],
        chestSpots: [
          ...prev.chestSpots,
        ],
        decorations: [
          ...(prev.decorations ?? []),
        ],
        floorRegions: [
          ...(prev.floorRegions ?? []),
        ],
        waterRegions: [
          ...(prev.waterRegions ?? []),
        ],
      };

      if (selected.type === "wall") {
        next.walls.splice(
          selected.index,
          1,
        );
      }

      if (selected.type === "pillar") {
        next.pillars.splice(
          selected.index,
          1,
        );
      }

      if (selected.type === "chest") {
        next.chestSpots.splice(
          selected.index,
          1,
        );
      }

      if (selected.type === "decoration") {
        next.decorations.splice(
          selected.index,
          1,
        );
      }

      if (selected.type === "floor") {
        next.floorRegions.splice(selected.index, 1);
      }

      if (selected.type === "water") {
        next.waterRegions.splice(selected.index, 1);
      }

      return next;
    });

    setSelected({
      type: null,
      index: -1,
    });
  };

  const addRect = (
    kind: "floor" | "water",
    rect: { x: number; y: number; width: number; height: number },
  ) => {
    const field = rectField(kind);

    setRoom((prev) => ({
      ...prev,
      [field]: [...(prev[field] ?? []), rect],
    }));

    setSelected({
      type: kind,
      index: (kind === "floor" ? floorRegions : waterRegions).length,
    });
  };

  const getPointerPosition = (
    e: PointerEvent<HTMLCanvasElement>,
  ) => {
    const rect =
      canvasRef.current!.getBoundingClientRect();

    return screenToWorld(
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  const handlePointerDown = (
    e: PointerEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();

    if (
      e.button === 1 ||
      e.shiftKey
    ) {
      dragRef.current = {
        type: "pan",
        startX: e.clientX,
        startY: e.clientY,
      };

      canvasRef.current?.setPointerCapture(
        e.pointerId,
      );

      return;
    }

    const world =
      getPointerPosition(e);

    if (tool === "select") {
      const hit =
        hitTest(
          world.x,
          world.y,
        );

      setSelected(hit);

      if (
        hit.type !== null &&
        hit.index >= 0
      ) {
        if (hit.type === "wall") {
          const wall =
            room.walls[hit.index];

          dragRef.current = {
            type: "move",
            startX: world.x,
            startY: world.y,
            originalX: wall.x,
            originalY: wall.y,
          };
        }

        if (hit.type === "pillar") {
          const pillar =
            room.pillars[hit.index];

          dragRef.current = {
            type: "move",
            startX: world.x,
            startY: world.y,
            originalX: pillar.x,
            originalY: pillar.y,
          };
        }

        if (hit.type === "chest") {
          const chest =
            room.chestSpots[hit.index];

          dragRef.current = {
            type: "move",
            startX: world.x,
            startY: world.y,
            originalX: chest.x,
            originalY: chest.y,
          };
        }

        if (hit.type === "decoration") {
          const decoration =
            decorations[hit.index];

          dragRef.current = {
            type: "move",
            startX: world.x,
            startY: world.y,
            originalX: decoration.x,
            originalY: decoration.y,
          };
        }

        if (hit.type === "floor" || hit.type === "water") {
          const region = (
            hit.type === "floor" ? floorRegions : waterRegions
          )[hit.index];

          dragRef.current = {
            type: "move",
            startX: world.x,
            startY: world.y,
            originalX: region.x,
            originalY: region.y,
          };
        }

        canvasRef.current?.setPointerCapture(
          e.pointerId,
        );
      }

      return;
    }

    if (tool === "wall") {
      const startX = snap(world.x);
      const startY = snap(world.y);

      wallDragRef.current = {
        startX,
        startY,
      };

      setWallPreview({
        x: startX,
        y: startY,
        width: 0,
        height: room.wallThickness,
      });

      canvasRef.current?.setPointerCapture(
        e.pointerId,
      );

      return;
    }

    if (tool === "pillar") {
      addPillar(
        world.x,
        world.y,
      );

      return;
    }

    if (tool === "chest") {
      addChest(
        world.x,
        world.y,
      );

      return;
    }

    if (tool === "decoration") {
      addDecoration(
        world.x,
        world.y,
      );

      return;
    }

    if (tool === "floor" || tool === "water") {
      const startX = snap(world.x);
      const startY = snap(world.y);

      rectDragRef.current = { startX, startY };

      setRectPreview({ x: startX, y: startY, width: 0, height: 0 });

      canvasRef.current?.setPointerCapture(e.pointerId);

      return;
    }

    if (tool === "erase") {
      const hit =
        hitTest(
          world.x,
          world.y,
        );

      if (hit.type !== null) {
        setSelected(hit);

        setRoom((prev) => {
          const next = {
            ...prev,
            walls: [...prev.walls],
            pillars: [...prev.pillars],
            chestSpots: [
              ...prev.chestSpots,
            ],
            decorations: [
              ...(prev.decorations ?? []),
            ],
            floorRegions: [
              ...(prev.floorRegions ?? []),
            ],
            waterRegions: [
              ...(prev.waterRegions ?? []),
            ],
          };

          if (hit.type === "wall") {
            next.walls.splice(
              hit.index,
              1,
            );
          }

          if (hit.type === "pillar") {
            next.pillars.splice(
              hit.index,
              1,
            );
          }

          if (hit.type === "chest") {
            next.chestSpots.splice(
              hit.index,
              1,
            );
          }

          if (hit.type === "decoration") {
            next.decorations.splice(
              hit.index,
              1,
            );
          }

          if (hit.type === "floor") {
            next.floorRegions.splice(hit.index, 1);
          }

          if (hit.type === "water") {
            next.waterRegions.splice(hit.index, 1);
          }

          return next;
        });

        setSelected({
          type: null,
          index: -1,
        });
      }
    }
  };

  const handlePointerMove = (
    e: PointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      tool === "wall" &&
      wallDragRef.current
    ) {
      const world =
        getPointerPosition(e);

      const start =
        wallDragRef.current;

      const endX = snap(world.x);
      const endY = snap(world.y);

      const dx =
        endX - start.startX;

      const dy =
        endY - start.startY;

      if (
        Math.abs(dx) >= Math.abs(dy)
      ) {
        setWallPreview({
          x: Math.min(
            start.startX,
            endX,
          ),
          y: start.startY,
          width: Math.abs(dx),
          height:
            room.wallThickness,
        });
      } else {
        setWallPreview({
          x: start.startX,
          y: Math.min(
            start.startY,
            endY,
          ),
          width:
            room.wallThickness,
          height: Math.abs(dy),
        });
      }

      return;
    }

    if (
      (tool === "floor" || tool === "water") &&
      rectDragRef.current
    ) {
      const world = getPointerPosition(e);

      const start = rectDragRef.current;

      const endX = snap(world.x);
      const endY = snap(world.y);

      setRectPreview({
        x: Math.min(start.startX, endX),
        y: Math.min(start.startY, endY),
        width: Math.abs(endX - start.startX),
        height: Math.abs(endY - start.startY),
      });

      return;
    }

    const drag =
      dragRef.current;

    if (!drag) {
      return;
    }

    if (drag.type === "pan") {
      setPan((prev) => ({
        x:
          prev.x +
          (e.clientX -
            drag.startX),
        y:
          prev.y +
          (e.clientY -
            drag.startY),
      }));

      drag.startX = e.clientX;
      drag.startY = e.clientY;

      return;
    }

    if (
      drag.type === "move" &&
      selected.type !== null &&
      selected.index >= 0
    ) {
      const world =
        getPointerPosition(e);

      const dx =
        world.x - drag.startX;

      const dy =
        world.y - drag.startY;

      const x = snap(
        (drag.originalX ?? 0) +
          dx,
      );

      const y = snap(
        (drag.originalY ?? 0) +
          dy,
      );

      setRoom((prev) => {
        const next = {
          ...prev,
          walls: [...prev.walls],
          pillars: [...prev.pillars],
          chestSpots: [
            ...prev.chestSpots,
          ],
          decorations: [
            ...(prev.decorations ?? []),
          ],
          floorRegions: [
            ...(prev.floorRegions ?? []),
          ],
          waterRegions: [
            ...(prev.waterRegions ?? []),
          ],
        };

        if (selected.type === "wall") {
          const wall =
            next.walls[selected.index];

          if (wall) {
            next.walls[
              selected.index
            ] = {
              ...wall,
              x,
              y,
            };
          }
        }

        if (selected.type === "pillar") {
          const pillar =
            next.pillars[selected.index];

          if (pillar) {
            next.pillars[
              selected.index
            ] = {
              ...pillar,
              x,
              y,
            };
          }
        }

        if (selected.type === "chest") {
          const chest =
            next.chestSpots[
              selected.index
            ];

          if (chest) {
            next.chestSpots[
              selected.index
            ] = {
              ...chest,
              x,
              y,
            };
          }
        }

        if (selected.type === "decoration") {
          const decoration =
            next.decorations[
              selected.index
            ];

          if (decoration) {
            next.decorations[
              selected.index
            ] = {
              ...decoration,
              x,
              y,
            };
          }
        }

        if (selected.type === "floor" || selected.type === "water") {
          const list =
            selected.type === "floor"
              ? next.floorRegions
              : next.waterRegions;

          const region = list[selected.index];

          if (region) {
            list[selected.index] = { ...region, x, y };
          }
        }

        return next;
      });
    }
  };

  const handlePointerUp = (
    e: PointerEvent<HTMLCanvasElement>,
  ) => {
    if (
      tool === "wall" &&
      wallDragRef.current
    ) {
      const world =
        getPointerPosition(e);

      const start =
        wallDragRef.current;

      const endX = snap(world.x);
      const endY = snap(world.y);

      const dx =
        endX - start.startX;

      const dy =
        endY - start.startY;

      let wall: {
        x: number;
        y: number;
        width: number;
        height: number;
      } | null = null;

      if (
        Math.abs(dx) >= Math.abs(dy) &&
        Math.abs(dx) >= GRID
      ) {
        wall = {
          x: Math.min(
            start.startX,
            endX,
          ),
          y: start.startY,
          width: Math.abs(dx),
          height:
            room.wallThickness,
        };
      } else if (
        Math.abs(dy) >= GRID
      ) {
        wall = {
          x: start.startX,
          y: Math.min(
            start.startY,
            endY,
          ),
          width:
            room.wallThickness,
          height: Math.abs(dy),
        };
      }

      if (wall) {
        setRoom((prev) => ({
          ...prev,
          walls: [
            ...prev.walls,
            wall!,
          ],
        }));

        setSelected({
          type: "wall",
          index: room.walls.length,
        });
      }

      wallDragRef.current = null;
      setWallPreview(null);

      if (
        canvasRef.current?.hasPointerCapture(
          e.pointerId,
        )
      ) {
        canvasRef.current.releasePointerCapture(
          e.pointerId,
        );
      }

      return;
    }

    if (
      (tool === "floor" || tool === "water") &&
      rectDragRef.current
    ) {
      const world = getPointerPosition(e);

      const start = rectDragRef.current;

      const endX = snap(world.x);
      const endY = snap(world.y);

      const rect = {
        x: Math.min(start.startX, endX),
        y: Math.min(start.startY, endY),
        width: Math.abs(endX - start.startX),
        height: Math.abs(endY - start.startY),
      };

      if (rect.width >= GRID && rect.height >= GRID) {
        addRect(tool, rect);
      }

      rectDragRef.current = null;
      setRectPreview(null);

      if (canvasRef.current?.hasPointerCapture(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }

      return;
    }

    dragRef.current = null;

    if (
      canvasRef.current?.hasPointerCapture(
        e.pointerId,
      )
    ) {
      canvasRef.current.releasePointerCapture(
        e.pointerId,
      );
    }
  };

  const handleWheel = (
    e: WheelEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();

    const rect =
      canvasRef.current!.getBoundingClientRect();

    const mouseX =
      e.clientX - rect.left;

    const mouseY =
      e.clientY - rect.top;

    const worldBefore =
      screenToWorld(
        mouseX,
        mouseY,
      );

    const factor =
      e.deltaY < 0
        ? 1.1
        : 0.9;

    const nextZoom =
      Math.max(
        0.25,
        Math.min(
          3,
          zoom * factor,
        ),
      );

    setZoom(nextZoom);

    setPan({
      x:
        mouseX -
        worldBefore.x *
          nextZoom,
      y:
        mouseY -
        worldBefore.y *
          nextZoom,
    });
  };

  useEffect(() => {
    const onKeyDown = (
      e: KeyboardEvent,
    ) => {
      if (
        e.key === "w" ||
        e.key === "W"
      ) {
        keysRef.current.w = true;
      }

      if (
        e.key === "a" ||
        e.key === "A"
      ) {
        keysRef.current.a = true;
      }

      if (
        e.key === "s" ||
        e.key === "S"
      ) {
        keysRef.current.s = true;
      }

      if (
        e.key === "d" ||
        e.key === "D"
      ) {
        keysRef.current.d = true;
      }

      if (
        e.key === "Delete" ||
        e.key === "Backspace"
      ) {
        removeSelected();
      }

      if (
        e.key === "+" ||
        e.key === "="
      ) {
        setZoom((z) =>
          Math.min(
            3,
            z * 1.1,
          ),
        );
      }

      if (e.key === "-") {
        setZoom((z) =>
          Math.max(
            0.25,
            z * 0.9,
          ),
        );
      }
    };

    const onKeyUp = (
      e: KeyboardEvent,
    ) => {
      if (
        e.key === "w" ||
        e.key === "W"
      ) {
        keysRef.current.w = false;
      }

      if (
        e.key === "a" ||
        e.key === "A"
      ) {
        keysRef.current.a = false;
      }

      if (
        e.key === "s" ||
        e.key === "S"
      ) {
        keysRef.current.s = false;
      }

      if (
        e.key === "d" ||
        e.key === "D"
      ) {
        keysRef.current.d = false;
      }
    };

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    window.addEventListener(
      "keyup",
      onKeyUp,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );

      window.removeEventListener(
        "keyup",
        onKeyUp,
      );
    };
  });

  useEffect(() => {
    let frame = 0;

    const updatePan = () => {
      const keys = keysRef.current;

      if (
        keys.w ||
        keys.a ||
        keys.s ||
        keys.d
      ) {
        setPan((prev) => ({
          x:
            prev.x +
            (keys.a ? PAN_SPEED : 0) -
            (keys.d ? PAN_SPEED : 0),
          y:
            prev.y +
            (keys.w ? PAN_SPEED : 0) -
            (keys.s ? PAN_SPEED : 0),
        }));
      }

      frame = requestAnimationFrame(
        updatePan,
      );
    };

    frame = requestAnimationFrame(
      updatePan,
    );

    return () =>
      cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0c0c12]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(e) =>
          e.preventDefault()
        }
      />

      <div className="pointer-events-none absolute left-3 top-3 rounded border border-white/10 bg-black/50 px-2 py-1 text-[11px] text-white/50 backdrop-blur">
        {tool.toUpperCase()} ·{" "}
        {Math.round(zoom * 100)}%
      </div>

      <button
        onClick={() => setShowGraphics((v) => !v)}
        className={`
          absolute right-3 top-3 rounded border px-2 py-1 text-[11px] backdrop-blur transition
          ${
            showGraphics
              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
              : "border-white/10 bg-black/50 text-white/50 hover:text-white/80"
          }
        `}
      >
        {showGraphics
          ? assetsReady
            ? "◉ Graphics: ON"
            : "◌ Loading…"
          : "○ Graphics: OFF"}
      </button>

      <div className="pointer-events-none absolute bottom-3 right-3 rounded border border-white/10 bg-black/50 px-2 py-1 text-[10px] text-white/40 backdrop-blur">
        WASD: pan · Shift + drag: pan · Middle mouse: pan · Wheel: zoom · Delete: remove
      </div>
    </div>
  );
};
