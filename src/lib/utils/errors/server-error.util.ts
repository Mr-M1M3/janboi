import Result from "../result/result.util";

export type SerializedServerError<D extends Record<string, unknown>> = {
  id: string;
  status: number;
  message: string;
  details: D;
};
export class ServerError<D extends Record<string, unknown>> {
  private id: string;
  private message: string;
  private status: number;
  private details: D;
  constructor(status: number, message: string, details: D) {
    this.status = status;
    this.id = crypto.randomUUID();
    this.message = message;
    this.details = details;
  }
  public to_result<IfWasNotError>(): Result<
    IfWasNotError,
    SerializedServerError<D>
  > {
    return Result.Err<IfWasNotError, SerializedServerError<D>>({
      id: this.id,
      status: this.status,
      message: this.message,
      details: this.details,
    });
  }
  public serilaize(): SerializedServerError<D> {
    return this.to_result().transform((from) => {
      const unwrapped_error = from.unwrap_err();
      return {
        id: unwrapped_error.id,
        status: unwrapped_error.status,
        message: unwrapped_error.message,
        details: unwrapped_error.details,
      };
    });
  }
}
