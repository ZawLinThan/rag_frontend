/** Move one item to the target's position without changing the input. */
export function reorderIds(
  ids: string[],
  source: string,
  target: string,
): string[] {
  const from = ids.indexOf(source);
  const to = ids.indexOf(target);
  if (from < 0 || to < 0 || from === to) return ids;
  const result = [...ids];
  result.splice(to, 0, ...result.splice(from, 1));
  return result;
}
