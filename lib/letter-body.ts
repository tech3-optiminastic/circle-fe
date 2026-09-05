/**
 * Shared markdown-lite parsing for editable letter wording (offer letters,
 * appointment letters — any letter that lets HR freely rewrite its prose while
 * a structural, non-text part — a computed table, a signature block with an
 * embedded image — stays fixed). Convention: a blank line starts a new block;
 * `**text**` is bold; a line starting with "- " is a bullet list item; a lone
 * line starting with "# " is the centered title heading.
 */

export type LetterBodyBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'lines'; lines: string[] };

export function parseLetterBlocks(text: string): LetterBodyBlock[] {
  return text
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map((block): LetterBodyBlock => {
      const lines = block
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      if (lines.length > 0 && lines.every(l => l.startsWith('- '))) {
        return { kind: 'list', items: lines.map(l => l.slice(2).trim()) };
      }
      if (lines.length === 1 && lines[0].startsWith('# ')) {
        return { kind: 'heading', text: lines[0].slice(2).trim() };
      }
      return { kind: 'lines', lines };
    });
}
