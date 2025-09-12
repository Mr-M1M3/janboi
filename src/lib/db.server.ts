import { DATABASE_URL } from "$env/static/private";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaBetterSQLite3({
  url: `./prisma/${DATABASE_URL.slice(DATABASE_URL.indexOf("/"))}`,
});
const prisma = new PrismaClient({
  adapter,
});

export default prisma;
