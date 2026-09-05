import { useEffect, useRef, useState } from "react";
import { Engine, KeyListener, Transform } from "./engine";
import { MouseListener } from "./engine/MouseListener";
import { StartScene } from "./scenes/StartScene";
import { SpriteSheetInspector } from "./editor/SpriteSheetInspector";
import { RoomEditor } from "./editor/room/RoomEditor";
import { AudioManager } from "./audio/AudioManager";
import { SettingsScene } from "./scenes/SettingsScene";
import { DungeonTutorial } from "./scenes/DungeonTutorial";
import { DungeonEntrance } from "./scenes/DungeonEntrance";

import menuUrl from "./assets/sound/music/Pineapple Under The Sea.ogg";
import dungeonUrl from "./assets/sound/music/Wanderer's Tale.ogg";
import bossUrl from "./assets/sound/music/Strange Worlds.ogg";
import { Player } from "./entities/Player";
import { Team } from "./entities/Team";
import { Dungeon_1 } from "./scenes/Dungeon_1";

export function DungeonGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [showInspector, setShowInspector] = useState(false);
  const [showRoomEditor, setShowRoomEditor] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;

    if (canvas === null || wrap === null) {
      return;
    }

    let disposed = false;

    const engine = new Engine(canvas);
    const startScene = new StartScene();

    const goToMenu = (): void => {
      setShowRoomEditor(false);
      AudioManager.get().playMusic("menu");
      engine.setScene(startScene);
    };

    const resize = (): void => {
      const rect = wrap.getBoundingClientRect();

      engine.onResize(
        Math.max(1, Math.floor(rect.width)),
        Math.max(1, Math.floor(rect.height)),
      );
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();

    const detachKeys = KeyListener.get().attach(canvas);
    const detachMouse = MouseListener.get().attach(canvas);

    const onGesture = (): void => {
      const audio = AudioManager.get();

      audio.unlock();
      audio.loadMusic("menu", menuUrl);
      audio.loadMusic("dungeon", dungeonUrl);
      audio.loadMusic("boss", bossUrl);

      const beep = audio.createBeep(880, 0.09);

      if (beep !== null) {
        audio.loadSoundBuffer("ding", beep);
      }

      audio.playMusic("menu");

      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };

    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);

    const onToggle = (e: KeyboardEvent): void => {
      if (e.code === "KeyJ") {
        setShowInspector((v) => !v);
      }
    };

    window.addEventListener("keydown", onToggle);

    const init = async (): Promise<void> => {
      const player = await Player.create(
        "Player",
        new Transform(
          120,
          120,
          52,
          52,
          0,
        ),
        new Team("players"),
      );

      if (disposed) {
        return;
      }

      const startDungeon1 = (): void => {
        setShowRoomEditor(false);

        const dungeon1 = new Dungeon_1(player);

        dungeon1.onRestart = startDungeon1;
        dungeon1.onMainMenu = goToMenu;
        dungeon1.onExit = startTutorial;

        engine.setScene(dungeon1);
        void dungeon1.load();
      };

      const startEntrance = (): void => {
        const entrance = new DungeonEntrance(player);

        entrance.onRestart = startEntrance;
        entrance.onMainMenu = goToMenu;
        entrance.onExit = startDungeon1;

        engine.setScene(entrance);
        void entrance.load();
      };

      const startTutorial = (): void => {
        const tutorial = new DungeonTutorial(player);

        tutorial.onExit = startEntrance;
        tutorial.onRestart = startTutorial;
        tutorial.onMainMenu = goToMenu;

        engine.setScene(tutorial);
        void tutorial.load();
      };

      startScene.onStart = startDungeon1;

      startScene.onRoomEditor = () => {
        setShowRoomEditor(true);
      };

      startScene.onSettings = () => {
        const settings = new SettingsScene();

        settings.onBack = () => {
          engine.setScene(startScene);
        };

        engine.setScene(settings);
      };

      engine.setScene(startScene);

      engine.start();
      canvas.focus();
    };

    void init();

    return () => {
      disposed = true;

      engine.stop();

      detachKeys();
      detachMouse();

      observer.disconnect();

      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("keydown", onToggle);

      const audio = AudioManager.get();
      audio.stopMusic();
      audio.dispose();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden bg-[#0e0e12]"
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onMouseDown={(e) => e.currentTarget.focus()}
        className="absolute inset-0 h-full w-full outline-none"
      />

      {showInspector && !showRoomEditor && (
        <SpriteSheetInspector
          onClose={() => setShowInspector(false)}
        />
      )}

      {showRoomEditor && (
        <RoomEditor
          onClose={() => {
            setShowRoomEditor(false);
            canvasRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}
