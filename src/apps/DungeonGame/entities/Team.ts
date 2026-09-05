export class Team {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  equals(other: Team | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.id === other.id;
  }

  key(): string {
    return this.id;
  }
}
