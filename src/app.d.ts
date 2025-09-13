// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { ErrorResponseData } from "$lib/types/ResponseData.type";

declare global {
  namespace App {
    interface Error extends ErrorResponseData<unknown, unknown> {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
