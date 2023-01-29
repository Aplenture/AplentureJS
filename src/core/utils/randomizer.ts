import { random, randomRanged, randomSeeded, shuffle } from "../crypto";

export class Randomizer {
    private _iterations = 0;
    private _currentSeed: number;

    constructor(public readonly originSeed = Number(random(4))) {
        this._currentSeed = originSeed;
    }

    public get iterations(): number { return this._iterations; }
    public get currentSeed(): number { return this._currentSeed; }

    public get nextSeed(): number {
        this.increaseSeed(1);
        return this._currentSeed;
    }

    public random(): number {
        const result = randomSeeded(this._currentSeed);
        this.increaseSeed(1);
        return result;
    }

    public ranged(max: number, min?: number): number {
        const result = randomRanged(max, min, this._currentSeed);
        this.increaseSeed(1);
        return result;
    }

    public shuffle<T>(items: readonly T[], reverse: boolean): T[] {
        const result = shuffle(items, this._currentSeed);

        this.increaseSeed(items.length);

        if (reverse)
            result.reverse();

        return result;
    }

    public pick<T>(items: readonly T[]): T {
        return items[this.ranged(items.length - 1)];
    }

    private increaseSeed(value: number): void {
        this._iterations += value;
        this._currentSeed += value;
    }
}