export interface PawnColorMatch {
  start: number;
  end: number;
  text: string;
  red: number;
  green: number;
  blue: number;
  alpha: number;
}

const colorPattern = /0x(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\{(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\}/g;

export function findPawnColors(text: string): PawnColorMatch[] {
  const matches: PawnColorMatch[] = [];
  for (const match of text.matchAll(colorPattern)) {
    const value = match[0];
    const digits = value.startsWith("{") ? value.slice(1, -1) : value.slice(2);
    const alpha = digits.length === 8 ? parseByte(digits.slice(6, 8)) : 255;
    matches.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + value.length,
      text: value,
      red: parseByte(digits.slice(0, 2)),
      green: parseByte(digits.slice(2, 4)),
      blue: parseByte(digits.slice(4, 6)),
      alpha,
    });
  }
  return matches;
}

function parseByte(value: string): number {
  return Number.parseInt(value, 16);
}
