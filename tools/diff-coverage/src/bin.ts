import { run } from "./cli.js";

run(process.argv[2] ?? "origin/main", process.cwd())
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
