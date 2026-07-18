import { containsNormalised } from "./normalise";

interface AliasEntity {
  name: string;
  aliases: string[];
}

export function findByAliases<T extends AliasEntity>(
  text: string,
  collection: readonly T[],
): T | undefined {
  for (const item of collection) {
    if (containsNormalised(text, item.name)) {
      return item;
    }

    for (const alias of item.aliases) {
      if (containsNormalised(text, alias)) {
        return item;
      }
    }
  }

  return undefined;
}