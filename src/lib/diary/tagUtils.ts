export const DEFAULT_TAG_COLOR = "#c9a6d4";

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase();
}

export function findTagByName<T extends { name: string }>(
  tags: T[],
  name: string,
): T | undefined {
  const normalized = normalizeTagName(name);
  return tags.find((tag) => normalizeTagName(tag.name) === normalized);
}
