import { drizzle } from "drizzle-orm/bun-sql";
import { config } from "./bot";

export const db = drizzle(config.DATABASE_URL);
