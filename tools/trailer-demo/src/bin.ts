import { record } from "./record.js";

const LANGS = ["pt-BR", "en"];
const FPS = 30;

/** Uso (na raiz do repo): `pnpm record:trailer-demo [slug]`, padrão `2-ordem-e-futuro`. */
export async function run(args: string[]): Promise<void> {
  const slug = args[0] ?? "2-ordem-e-futuro";
  for (const lang of LANGS) {
    const out = `assets/trailers/clips/${slug}/demo-v0-${lang}.mp4`;
    await record({ page: `tools/trailer-demo/pages/${slug}.html`, lang, out, fps: FPS });
    console.log(`✓ ${out}`);
  }
}

run(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
