export class Sound {
  private ctx: AudioContext;
  private buffer: AudioBuffer;
  private destination: AudioNode;

  constructor(ctx: AudioContext, buffer: AudioBuffer, destination: AudioNode) {
    this.ctx = ctx;
    this.buffer = buffer;
    this.destination = destination;
  }

  play(): void {
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.destination);
    source.start();
  }
}
