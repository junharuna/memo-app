const MAX_EXCERPT_LENGTH = 240;

export function createMemoExcerpt(markdown: string): string {
  const plainText = markdown
    .replace(/\r\n?/g, "\n")
    .replace(/^\s{0,3}(?:`{3,}|~{3,}).*$/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/([^>]+)>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-+*]\s+\[[ xX]\]\s+/gm, "")
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, "")
    .replace(/^\s*(?:\|?\s*:?-{3,}:?\s*)+(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, "")
    .replace(/\|/g, " ")
    .replace(/(?:\*\*|__|~~|`)/g, "")
    .replace(/(^|\s)[*_](?=\S)|(?<=\S)[*_](?=\s|$)/g, "$1")
    .replace(/\\([\\`*_[\]{}()#+\-.!>])/g, "$1")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const characters = Array.from(plainText);

  if (characters.length <= MAX_EXCERPT_LENGTH) {
    return plainText;
  }

  return `${characters.slice(0, MAX_EXCERPT_LENGTH).join("")}…`;
}
