export class Music {
  private element: HTMLAudioElement;

  constructor(ctx: AudioContext, url: string, destination: AudioNode) {
    this.element = new Audio(url);
    this.element.loop = true;
    const source = ctx.createMediaElementSource(this.element);
    source.connect(destination);
  }

  play(): void {
    void this.element.play().catch(() => {
    });
  }

  pause(): void {
    this.element.pause();
  }

  stop(): void {
    this.element.pause();
    this.element.currentTime = 0;
  }
}
