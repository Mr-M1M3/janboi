// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type {
  ErrorResponseData,
  ResponseData,
} from "$lib/types/ResponseData.type";

declare global {
  namespace App {
    interface Error extends ErrorResponseData<unknown> {}
    // interface Locals {}
    interface PageData extends ResponseData<unknown, unknown> {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
