import seedrandom, { PRNG } from "seedrandom";

export class Random {
  constructor(private _rnd: PRNG) {}

  public float = () => this._rnd.double();

  public floatNear = (mean: number, deviation: number) =>
    this.floatFromInterval(mean - deviation, mean + deviation);

  public floatFromInterval = (from: number, to: number) =>
    Math.min(from, to) + this.float() * Math.abs(to - from);

  public int = () => Math.abs(this._rnd.int32());

  public intNear = (mean: number, deviation: number) =>
    this.intFromInterval(mean - deviation, mean + deviation);

  public intFromInterval = (from: number, to: number) =>
    Math.floor(Math.min(from, to)) +
    (this.int() % Math.floor(Math.abs(to - from) + 1));

  public from = <T>(elems: T[]) =>
    elems[this.intFromInterval(0, elems.length - 1)];

  public of = <T>(...args: T[]) => this.from(args);

  //#region Static:

  static unpredictable = new Random(seedrandom());

  static bySeed = (seed: string) => new Random(seedrandom(seed));

  public static float = this.unpredictable.float;

  public static floatNear = this.unpredictable.floatNear;

  public static floatFromInterval = this.unpredictable.floatFromInterval;

  public static int = this.unpredictable.int;

  public static intNear = this.unpredictable.intNear;

  public static intFromInterval = this.unpredictable.intFromInterval;

  public static from = this.unpredictable.from;

  public static of = this.unpredictable.of;

  //#endregion
}

export default Random;
