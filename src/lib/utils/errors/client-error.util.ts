import Result from "../result/result.util";

type SerializedError<D extends Record<string, unknown>> = {
  id: string;
  status: number;
  message: string;
  details: D;
};
export class ClientError<D extends Record<string, unknown>> {
  private message: string;
  private id: string;
  private status: number;
  constructor(status: number, message: string, details: D) {
    (this.id = crypto.randomUUID()), (this.status = status);
    this.message = message;
  }

  public serialize<IfWasNotError>(
    details: D
  ): Result<IfWasNotError, SerializedError<D>> {
    return Result.Err<IfWasNotError, SerializedError<D>>({
      id: this.id,
      status: this.status,
      message: this.message,
      details,
    });
  }
}
