import { ClientError } from "./client-error.util";

export class NotFound extends ClientError<{}> {
  constructor() {
    super(404, "requested resource wasn't found on the server", {});
  }
}
