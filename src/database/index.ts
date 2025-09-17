import { drizzle } from "drizzle-orm/bun-sql";
import { env } from "~/utils/env";

export const db = drizzle(env.DATABASE_URL);
