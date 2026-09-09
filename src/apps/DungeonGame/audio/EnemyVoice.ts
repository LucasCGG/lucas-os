import { EntityAttributes } from "../attributes/EntityAttributes";
import { AudioManager } from "./AudioManager";

/**
 * Flavor sound sets for enemies, sourced from the NinjaAssassin, BloodElemental
 * and BloodMage sound packs. These give melee/archer enemies varied attack,
 * hurt and death sounds without needing distinct gameplay per archetype.
 */
export type EnemyVoiceName = "ninja" | "blood" | "mage";

interface VoiceClips {
  attack: string[];
  hurt: string[];
  death: string;
}

const VOICES: Record<EnemyVoiceName, VoiceClips> = {
  ninja: {
    attack: ["ninja_attack_1", "ninja_attack_2"],
    hurt: ["ninja_hurt_1", "ninja_hurt_2"],
    death: "ninja_death",
  },
  blood: {
    attack: ["blood_attack"],
    hurt: ["blood_hurt_1", "blood_hurt_2", "blood_hurt_3"],
    death: "blood_death",
  },
  mage: {
    attack: ["mage_attack_1", "mage_attack_2", "mage_attack_3"],
    hurt: ["mage_hurt_1", "mage_hurt_2"],
    death: "mage_death",
  },
};

const VOICE_NAMES = Object.keys(VOICES) as EnemyVoiceName[];

function pickRandom(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

export function randomEnemyVoice(): EnemyVoiceName {
  return VOICE_NAMES[Math.floor(Math.random() * VOICE_NAMES.length)];
}

export function pickAttackSound(voice: EnemyVoiceName): string[] {
  return VOICES[voice].attack;
}

export function attachEnemyVoice(
  stats: EntityAttributes,
  voice: EnemyVoiceName,
  onHurt?: () => void,
  onDeath?: () => void,
): void {
  const clips = VOICES[voice];

  stats.setOnDamaged(() => {
    AudioManager.get().playSound(pickRandom(clips.hurt));
    onHurt?.();
  });

  stats.setOnDeath(() => {
    AudioManager.get().playSound(clips.death);
    onDeath?.();
  });
}
