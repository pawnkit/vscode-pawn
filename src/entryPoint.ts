export interface SymbolNode<T> {
  name: string;
  kind: number;
  range: T;
  children?: readonly SymbolNode<T>[];
}

export function findTopLevelMain<T>(symbols: readonly SymbolNode<T>[], functionKind: number): T | undefined {
  return symbols.find((symbol) => symbol.name === "main" && symbol.kind === functionKind)?.range;
}
