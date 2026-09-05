import { RoomTemplate } from "../../../scenes/RoomTemplate";

export type RoomTool = | "select" | "wall" | "pillar" | "chest" | "erase";

export interface EditorSelection{
  type: | "wall" | "pillar" | "chest" | null;
  index: number,
}

export interface RoomEditorState {
  room: RoomTemplate;
  tool: RoomTool;
  selection: EditorSelection;

  gridSize: number;
  snapToGrid: boolean;
  showCollision: boolean;
}

export interface RoomEditorViewport {
  zoom: number;
  offsetX: number;
  offsetY: number;
}
