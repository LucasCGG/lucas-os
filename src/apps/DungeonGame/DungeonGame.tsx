import { useEffect, useRef, useState } from "react";
import { Engine, KeyListener, Transform } from "./engine";
import { MouseListener } from "./engine/input/MouseListener";
import { StartScene } from "./scenes/StartScene";
import { SpriteSheetInspector } from "./editor/SpriteSheetInspector";
import { RoomEditor } from "./editor/room/RoomEditor";
import { AudioManager } from "./audio/AudioManager";
import { SettingsScene } from "./scenes/SettingsScene";
import { DungeonTutorial } from "./scenes/DungeonTutorial";

import menuUrl from "./assets/sound/music/Pineapple Under The Sea.ogg";
import dungeonUrl from "./assets/sound/music/Distance full.wav";
import bossUrl from "./assets/sound/music/02 Battle Theme 2.ogg";
import gameOverUrl from "./assets/sound/music/08 Game Over.ogg";

import stepStone1Url from "./assets/sound/_Generic_Human/Step_stone_1.wav";
import stepStone2Url from "./assets/sound/_Generic_Human/Step_stone_2.wav";
import stepStone3Url from "./assets/sound/_Generic_Human/Step_stone_3.wav";

import shoot1Url from "./assets/sound/TechGunslinger/General_Animations/TechGunslinger_Shoot_1_Bullet_Only.ogg";
import shoot2Url from "./assets/sound/TechGunslinger/General_Animations/TechGunslinger_Shoot_2_Bullet_Only.ogg";
import shoot3Url from "./assets/sound/TechGunslinger/General_Animations/TechGunslinger_Shoot_3_Bullet_Only.ogg";
import impact1Url from "./assets/sound/TechGunslinger/General_Animations/TechGunslinger_Projectile_Impact_1.ogg";
import impact2Url from "./assets/sound/TechGunslinger/General_Animations/TechGunslinger_Projectile_Impact_2.ogg";

import ninjaAttack1Url from "./assets/sound/NinjaAssassin/General_Moves/NinjaAssassin_Attack_1.ogg";
import ninjaAttack2Url from "./assets/sound/NinjaAssassin/General_Moves/NinjaAssassin_Attack_2.ogg";
import ninjaHurt1Url from "./assets/sound/NinjaAssassin/General_Moves/NinjaAssassin_Damage_1.ogg";
import ninjaHurt2Url from "./assets/sound/NinjaAssassin/General_Moves/NinjaAssassin_Damage_2.ogg";
import ninjaDeathUrl from "./assets/sound/NinjaAssassin/General_Moves/NinjaAssassin_Death.ogg";

import bloodAttackUrl from "./assets/sound/BloodElemental/BloodElemental_Attack_1_Start.ogg";
import bloodHurt1Url from "./assets/sound/BloodElemental/BloodElemental_Damage_1.ogg";
import bloodHurt2Url from "./assets/sound/BloodElemental/BloodElemental_Damage_2.ogg";
import bloodHurt3Url from "./assets/sound/BloodElemental/BloodElemental_Damage_3.ogg";
import bloodDeathUrl from "./assets/sound/BloodElemental/BloodElemental_Banish-Die.ogg";

import mageAttack1Url from "./assets/sound/BloodMage/General_Animations/BloodMage_Attack_1.ogg";
import mageAttack2Url from "./assets/sound/BloodMage/General_Animations/BloodMage_Attack_2.ogg";
import mageAttack3Url from "./assets/sound/BloodMage/General_Animations/BloodMage_Attack_3.ogg";
import mageHurt1Url from "./assets/sound/BloodMage/General_Animations/BloodMage_Damage_1.ogg";
import mageHurt2Url from "./assets/sound/BloodMage/General_Animations/BloodMage_Damage_2.ogg";
import mageDeathUrl from "./assets/sound/BloodMage/General_Animations/BloodMage_Death.ogg";

import { Player } from "./entities/Player";
import { Team } from "./entities/Team";
import { Level1 } from "./scenes/Level1";
import { useIsMobile } from "../../hooks";
import { TouchListener } from "./engine/input/TouchListener";
import { useLandscapeLock } from "../../hooks/useLandscapeLock";
import { MobileHud } from "./ui/mobile/MobileHud";
import { RotatePrompt } from "./ui/mobile/RotatePrompt";
import { useWindowStore } from "../../atoms";

export function DungeonGame() {
  const isMobile = useIsMobile();
  const closeApp = useWindowStore((state) => state.closeApp);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [wrapEl, setWrapEl] = useState<HTMLDivElement | null>(null);

  const [showInspector, setShowInspector] = useState(false);
  const [showRoomEditor, setShowRoomEditor] = useState(false);
  const [inGame, setInGame] = useState(false);

  const isPortrait = useLandscapeLock(isMobile, wrapEl);

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
      setInGame(false);
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

    let detachTouch = null;
    let detachKeys = null;
    let detachMouse = null;

    if (isMobile) {
      detachTouch = TouchListener.get().attach(canvas);
      detachMouse = MouseListener.get().attachTouch(canvas);
    } else {
      detachKeys = KeyListener.get().attach(canvas);
      detachMouse = MouseListener.get().attach(canvas);
    }


    const onGesture = (): void => {
      const audio = AudioManager.get();

      audio.unlock();
      audio.loadMusic("menu", menuUrl);
      audio.loadMusic("dungeon", dungeonUrl);
      audio.loadMusic("boss", bossUrl);
      audio.loadMusic("gameOver", gameOverUrl);

      const beep = audio.createBeep(880, 0.09);

      if (beep !== null) {
        audio.loadSoundBuffer("ding", beep);
      }

      void Promise.all([
        audio.loadSound("step_stone_1", stepStone1Url),
        audio.loadSound("step_stone_2", stepStone2Url),
        audio.loadSound("step_stone_3", stepStone3Url),

        audio.loadSound("shoot_1", shoot1Url),
        audio.loadSound("shoot_2", shoot2Url),
        audio.loadSound("shoot_3", shoot3Url),
        audio.loadSound("impact_1", impact1Url),
        audio.loadSound("impact_2", impact2Url),

        audio.loadSound("ninja_attack_1", ninjaAttack1Url),
        audio.loadSound("ninja_attack_2", ninjaAttack2Url),
        audio.loadSound("ninja_hurt_1", ninjaHurt1Url),
        audio.loadSound("ninja_hurt_2", ninjaHurt2Url),
        audio.loadSound("ninja_death", ninjaDeathUrl),

        audio.loadSound("blood_attack", bloodAttackUrl),
        audio.loadSound("blood_hurt_1", bloodHurt1Url),
        audio.loadSound("blood_hurt_2", bloodHurt2Url),
        audio.loadSound("blood_hurt_3", bloodHurt3Url),
        audio.loadSound("blood_death", bloodDeathUrl),

        audio.loadSound("mage_attack_1", mageAttack1Url),
        audio.loadSound("mage_attack_2", mageAttack2Url),
        audio.loadSound("mage_attack_3", mageAttack3Url),
        audio.loadSound("mage_hurt_1", mageHurt1Url),
        audio.loadSound("mage_hurt_2", mageHurt2Url),
        audio.loadSound("mage_death", mageDeathUrl),
      ]);

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

      const startLevel1 = (): void => {
        setShowRoomEditor(false);
        setInGame(true);

        player.getStats().revive();

        const dungeon1 = new Level1(player);

        dungeon1.onRestart = startLevel1;
        dungeon1.onMainMenu = goToMenu;
        dungeon1.onExit = startTutorial;

        engine.setScene(dungeon1);
        void dungeon1.load();
      };

      const startTutorial = (): void => {
        setInGame(true);

        player.getStats().revive();

        const tutorial = new DungeonTutorial(player);

        tutorial.onExit = startLevel1;
        tutorial.onRestart = startTutorial;
        tutorial.onMainMenu = goToMenu;

        engine.setScene(tutorial);
        void tutorial.load();
      };

      startScene.onStart = startTutorial;

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

      startScene.onQuit = () => {
        closeApp("dungeon");
      };

      engine.setScene(startScene);

      engine.start();
      canvas.focus();
    };

    void init();

    return () => {
      disposed = true;

      engine.stop();

      detachKeys?.();
      detachMouse?.();
      detachTouch?.();

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
      ref={(el) => {
        wrapRef.current = el;
        setWrapEl(el);
      }}
      className="absolute inset-0 overflow-hidden bg-[#0e0e12]"
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onMouseDown={(e) => e.currentTarget.focus()}
        className="absolute inset-0 h-full w-full outline-none touch-none select-none"
      />

      {isMobile && inGame && !showRoomEditor && !showInspector && <MobileHud />}

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

      {isMobile && isPortrait && <RotatePrompt />}
    </div>
  );
}
