// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { auth } from "$lib/better-auth/auth.server";
import type {
  ErrorResponseData,
  ResponseData,
} from "$lib/types/ResponseData.type";
declare global {
  namespace App {
    interface Error extends ErrorResponseData<unknown> {}
    interface Locals {
      session: Awaited<ReturnType<typeof auth.api.getSession>> | null;
    }
    interface PageData extends ResponseData<unknown, unknown> {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
