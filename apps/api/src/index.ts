import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createDb } from "./db/client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3001);
const assetsDir = process.env.ASSETS_DIR ?? path.resolve(dirname, "../../../assets/images");

const db = createDb();

createApp({ db, assetsDir }).listen(port, () => {
  console.log(`[api] escutando em http://localhost:${port}`);
});
