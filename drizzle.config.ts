import "./compression-polyfill";
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
    out: "./drizzle",
    schema: "./src/database/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env["DATABASE_URL"]!,
    },
});
