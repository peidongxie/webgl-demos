interface ComponentProps {
  [key: string]: never;
}

interface MatchData {
  value: [string, string];
  children: [string, string][];
}

type Tuple<T, N extends number = number> = N extends never
  ? never
  : number extends N
    ? T[]
    : _Tuple<T, N>;
type _Tuple<T, N extends number, R extends T[] = []> = N extends R['length']
  ? R
  : _Tuple<T, N, [T, ...R]>;

export { type ComponentProps, type MatchData, type Tuple };
