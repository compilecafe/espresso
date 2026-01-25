import { cleanEnv, str, bool } from "envalid";

export const config = cleanEnv(Bun.env, {
    DISCORD_TOKEN: str(),
    CLIENT_ID: str(),
    DATABASE_URL: str(),
    DEBUG: bool({ default: false }),
});
