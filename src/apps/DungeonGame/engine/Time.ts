export class Time {
  static getTime(): number{
    return performance.now() / 1000;
  }
}
