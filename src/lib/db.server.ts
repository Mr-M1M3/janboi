import { config } from "dotenv";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma/client";
config();
const adapter = new PrismaBetterSQLite3({
  url: `./prisma/${process.env.DATABASE_URL?.slice(
    process.env.DATABASE_URL.indexOf("/")
  )}`,
});
const prisma = new PrismaClient({
  adapter,
});

export default prisma;
