import { cleanEnv, str } from "envalid";

export const env = cleanEnv(Bun.env, {
    DATABASE_URL: str(),
    DISCORD_TOKEN: str(),
    CLIENT_ID: str(),
    NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
});
