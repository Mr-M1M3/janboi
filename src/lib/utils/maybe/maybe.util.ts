export default class Maybe<T> {
  private value: T | null;

  constructor(val: T | null = null) {
    this.value = val;
  }
  //useful methods
  public is_value(): boolean {
    if (this.value === null) {
      return true;
    } else {
      return false;
    }
  }
  public is_not_a_value(): boolean {
    return !this.is_value();
  }
  public expect(msg: string): T {
    if (this.is_value()) {
      return this.value as T;
    } else {
      throw new Error(msg);
    }
  }
  public unwrap(): T {
    return this.expect('Expected a value but didnt get one.')
  }
  public unwrap_or(def: T): T {
    if (this.is_value()) {
      return this.value as T;
    } else {
      return def;
    }
  }
  public unwrap_or_else(fn: () => T): T {
    return this.unwrap_or(fn())
  }
  public map<U>(fn: (v: T) => U): Maybe<U> {
    if (this.is_value()) {
      return new Maybe<U>(fn(this.value as T));
    } else {
      return new Maybe<U>(null);
    }
  }
  public transform<To>(fn: (from: typeof this) => To): To {
    return fn(this);
  }
}
