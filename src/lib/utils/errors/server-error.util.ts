import Result from "../result/result.util";

type SerializedServerError<D extends Record<string, unknown>> = {
  id: string;
  status: number;
  message: string;
  details: D;
};
export class ServerError<D extends Record<string, unknown>> {
  private id: string;
  private message: string;
  private status: number;
  constructor(status: number, message: string, details: D) {
    this.status = status;
    this.id = crypto.randomUUID();
    this.message = message;
  }

  public serialize<IfWasNotError>(
    details: D
  ): Result<IfWasNotError, SerializedServerError<D>> {
    return Result.Err<IfWasNotError, SerializedServerError<D>>({
      id: this.id,
      status: this.status,
      message: this.message,
      details,
    });
  }
}
