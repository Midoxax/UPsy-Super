// Machine translations fill the gaps in a hand-written locale.
//
// scripts/i18n/translate.ts writes locales/auto/<locale>.json: flat dotted
// keys ("blog.anxiety.title") for every English key the hand-written file
// lacks. Hand-written text always wins, so a translator's fix in fr.ts or
// ar.ts is never overwritten; deleting the hand-written key hands it back to
// the machine translation.
type Tree = { [key: string]: unknown };

export function withAuto<T extends Tree>(
  manual: T,
  auto: Record<string, string>,
): T {
  const out = structuredClone(manual) as Tree;
  for (const [key, text] of Object.entries(auto)) {
    const parts = key.split(".");
    let node: Tree | null = out;
    for (const part of parts.slice(0, -1)) {
      const next: unknown = node[part];
      if (next === undefined) node = node[part] = {} as Tree;
      else if (next && typeof next === "object" && !Array.isArray(next))
        node = next as Tree;
      else {
        node = null; // a hand-written string sits where this key would branch
        break;
      }
    }
    const last = parts[parts.length - 1];
    if (node && node[last] === undefined) node[last] = text;
  }
  return out as T;
}
