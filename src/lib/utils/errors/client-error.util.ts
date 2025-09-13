import Result from "../result/result.util";

type SerializedClientError<D extends Record<string, unknown>> = {
  status: number;
  message: string;
  details: D;
};
export class ClientError<D extends Record<string, unknown>> {
  private message: string;
  private status: number;
  private details: D;
  constructor(status: number, message: string, details: D) {
    this.status = status;
    this.message = message;
    this.details = details;
  }

  public to_result<IfWasNotError>(): Result<
    IfWasNotError,
    SerializedClientError<D>
  > {
    return Result.Err<IfWasNotError, SerializedClientError<D>>({
      status: this.status,
      message: this.message,
      details: this.details,
    });
  }
  public serilaize(): SerializedClientError<D> {
    return this.to_result().transform((from) => {
      const unwrapped_error = from.unwrap_err();
      return {
        status: unwrapped_error.status,
        message: unwrapped_error.message,
        details: unwrapped_error.details,
      };
    });
  }
}
