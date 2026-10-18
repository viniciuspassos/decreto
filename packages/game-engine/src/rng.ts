/** RNG da partida: mulberry32, cujo estado (`seed`) fica no estado do servidor e nunca vai ao cliente. */
export interface Rng {
  /** Uniforme em [0, 1). */
  next(): number;
  /** Normal padrão N(0,1) (Box-Muller). */
  normal(): number;
  /** Estado atual, para guardar e continuar a sequência no próximo semestre. */
  seed(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next());
  return { next, normal, seed: () => s };
}
