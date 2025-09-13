export type ResponseData<T, D> = OkResponseData<T> | ErrorResponseData<D>;

export type ErrorResponseData<D> = {
  success: false;
  status: number;
  message: string;
  details: D;
};

export type OkResponseData<T> = {
  success: true;
  data: T;
};
