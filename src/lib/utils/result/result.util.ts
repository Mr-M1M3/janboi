import Maybe from "../maybe/maybe.util.js";

export default class Result<T, E> {
  private ok: Maybe<T>;
  private err: Maybe<E>;

  private constructor(ok: T | null, err: E | null) {
    this.ok = new Maybe<T>(ok);
    this.err = new Maybe<E>(err);
  }

  //public interface to construct an instance
  public static Ok<T, E>(val: T): Result<T, E> {
    return new Result<T, E>(val, null);
  }
  public static Err<T, E>(err: E): Result<T, E> {
    return new Result<T, E>(null, err);
  }
  //useful methods
  public is_ok(): boolean {
    return this.ok.is_value();
  }
  public is_error(): boolean {
    return this.err.is_value();
  }
  public expect(msg: string): T {
    return this.ok.expect(msg);
  }
  public expect_err(msg: string): E {
    return this.err.expect(msg);
  }
  public unwrap(): T {
    return this.ok.unwrap();
  }
  public unwrap_err(): E {
    return this.err.unwrap();
  }
  public unwrap_or(def: T): T {
    return this.ok.unwrap_or(def);
  }
  public unwrap_err_or(def: E): E {
    return this.err.unwrap_or(def);
  }
  public unwrap_or_else(fn: () => T): T {
    return this.ok.unwrap_or_else(fn);
  }
  public unwrap_err_or_else(fn: () => E): E {
    return this.err.unwrap_or_else(fn);
  }
  public map<U, Q>(
    ok_mapper: (val: T) => U,
    err_mapper: (err: E) => Q
  ): Result<U, Q> {
    if (this.is_ok()) {
      return Result.Ok<U, Q>(ok_mapper(this.ok.unwrap()));
    } else {
      return Result.Err<U, Q>(err_mapper(this.err.unwrap()));
    }
  }
  public map_ok<U>(fn: (val: T) => U): Result<U, E> {
    return this.map<U, E>(fn, (err) => err);
  }
  public map_err<Q>(fn: (val: E) => Q): Result<T, Q> {
    return this.map<T, Q>((v) => v, fn);
  }
  public transform<To>(fn: (from: typeof this) => To): To {
    return fn(this);
  }
}
