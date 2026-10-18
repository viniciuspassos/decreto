import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import { createDb, type Db } from "./db/client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function startServer(db: Db = createDb()): Server {
  const port = Number(process.env.PORT ?? 3001);
  const assetsDir = process.env.ASSETS_DIR ?? path.resolve(dirname, "../../../assets/images");

  return createApp({ db, assetsDir }).listen(port, () => {
    console.log(`[api] escutando em http://localhost:${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  /* istanbul ignore next -- bootstrap de CLI, não roda sob o import dos testes */
  startServer();
}
