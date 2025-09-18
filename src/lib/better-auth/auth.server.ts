import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db.server";
import { topic_plugin } from "./plugins/topic/topic.plugin";
import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
} from "$env/static/private";

export const auth = (base_url: string) => betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  plugins: [topic_plugin(), sveltekitCookies(getRequestEvent)], //sveltekit plugin should be the last one
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
    },
  },
  baseURL: base_url,
  basePath: "/api/auth",
});
