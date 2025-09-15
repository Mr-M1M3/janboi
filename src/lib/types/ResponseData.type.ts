export type ResponseData<T, D> = OkResponseData<T> | ErrorResponseData<D>;

export type ErrorResponseData<D> = {
  success: false;
  status: number;
  message: string;
  details: D;
  superform?: Record<string, unknown>;
};

export type OkResponseData<T> = {
  success: true;
  data: T;
  status?: number;
  message?: string;
  superform?: Record<string, unknown>;
};
