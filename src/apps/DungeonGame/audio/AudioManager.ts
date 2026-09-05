import { Music } from "./Music";
import { Sound } from "./Sound";

export class AudioManager {
  private static instance: AudioManager | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private sounds = new Map<string, Sound>();
  private musicTracks = new Map<string, Music>();
  private currentMusic: Music | null = null;

  private masterVolume = 1.0;
  private sfxVolume = 1.0;
  private musicVolume = 0.5;

  private constructor() {}

  static get(): AudioManager {
    if (AudioManager.instance === null) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private ensureContext(): void {
    if (this.ctx !== null) {
      return;
    }
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctor();

    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();

    this.masterGain.gain.value = this.masterVolume;
    this.sfxGain.gain.value = this.sfxVolume;
    this.musicGain.gain.value = this.musicVolume;

    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  unlock(): void {
    this.ensureContext();
    void this.ctx?.resume();
  }

  loadSoundBuffer(name: string, buffer: AudioBuffer): void {
    this.ensureContext();
    if (this.ctx !== null && this.sfxGain !== null) {
      this.sounds.set(name, new Sound(this.ctx, buffer, this.sfxGain));
    }
  }

  async loadSound(name: string, url: string): Promise<void> {
    this.ensureContext();
    if (this.ctx === null || this.sfxGain === null) {
      return;
    }
    const response = await fetch(url);
    const buffer = await this.ctx.decodeAudioData(await response.arrayBuffer());
    this.sounds.set(name, new Sound(this.ctx, buffer, this.sfxGain));
  }

  loadMusic(name: string, url: string): void {
    this.ensureContext();
    if (this.ctx !== null && this.musicGain !== null) {
      this.musicTracks.set(name, new Music(this.ctx, url, this.musicGain));
    }
  }

  playSound(name: string): void {
    const sound = this.sounds.get(name);
    if (sound !== undefined) {
      sound.play();
    } else {
      console.error(`AudioManager: unknown sound '${name}'`);
    }
  }

  playMusic(name: string): void {
    this.currentMusic?.stop();
    this.currentMusic = this.musicTracks.get(name) ?? null;
    if (this.currentMusic !== null) {
      this.currentMusic.play();
    } else {
      console.error(`AudioManager: unknown music '${name}'`);
    }
  }

  pauseMusic(): void {
    this.currentMusic?.pause();
  }

  stopMusic(): void {
    this.currentMusic?.stop();
  }

  resumeMusic(): void {
    this.currentMusic?.play();
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume;
    if (this.masterGain !== null) {
      this.masterGain.gain.value = volume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = volume;
    if (this.sfxGain !== null) {
      this.sfxGain.gain.value = volume;
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = volume;
    if (this.musicGain !== null) {
      this.musicGain.gain.value = volume;
    }
  }

  createBeep(frequency = 880, seconds = 0.09): AudioBuffer | null {
    this.ensureContext();
    if (this.ctx === null) {
      return null;
    }
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = this.ctx.createBuffer(1, length, rate);
    const data = buffer.getChannelData(0);
    const decay = rate * 0.03;
    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const envelope = Math.min(1, (length - i) / decay);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * envelope;
    }
    return buffer;
  }

  getMasterVolume(): number{
    return this.masterVolume;
  }
  getMusicVolume(): number{
    return this.musicVolume;
  }
  getSfxVolume(): number{
    return this.sfxVolume;
  }

  suspend(): void{
    this.currentMusic?.stop();
    void this.ctx?.suspend();
  }

  dispose(): void {
    this.currentMusic?.stop();
    void this.ctx?.close();
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.sounds.clear();
    this.musicTracks.clear();
    AudioManager.instance = null;
  }
}
