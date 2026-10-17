export type ChangedLinesByFile = Map<string, Set<number>>;

export interface UncoveredChange {
  file: string;
  line: number;
}
