import "dotenv/config";
import { createApp } from "./bootstrap";

const app = createApp();

await app.start();
