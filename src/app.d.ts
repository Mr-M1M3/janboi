// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { SerializedClientError } from "$lib/utils/errors/client-error.util";
import { SerializedServerError } from "$lib/utils/errors/server-error.util";

declare global {
  namespace App {
    interface Error extends SerializedClientError, SerializedServerError {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
