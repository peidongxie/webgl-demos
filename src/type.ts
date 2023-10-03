interface ComponentProps {
  [key: string]: never;
}

interface MatchData {
  value: [string, string];
  children: [string, string][];
}

export { type ComponentProps, type MatchData };
