/**
 * Minimal inline markdown renderer for assistant chat messages.
 * Supports:
 *   - headings (#, ##, ###)
 *   - bold (**text**)
 *   - italic (*text* or _text_)
 *   - inline code (`code`)
 *   - unordered bullets (- or *)
 *   - ordered lists (1. 2. 3.)
 *   - blank-line paragraphs
 *
 * No raw HTML, no tables, no links — kept intentionally small so we avoid
 * pulling in a markdown dependency for what is mostly plain LLM prose.
 */

function renderInline(text, keyPrefix = '') {
  // Tokenise the string into bold / italic / code / plain runs, recursively.
  const parts = [];
  let i = 0;
  let key = 0;

  while (i < text.length) {
    // bold: **...**
    if (text[i] === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        parts.push(<strong key={`${keyPrefix}b${key++}`}>{renderInline(text.slice(i + 2, end), `${keyPrefix}b${key}-`)}</strong>);
        i = end + 2;
        continue;
      }
    }
    // italic: *...* or _..._
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i];
      const end = text.indexOf(marker, i + 1);
      // require the italic to end before a newline so we don't eat multi-line content
      if (end !== -1 && !text.slice(i + 1, end).includes('\n') && text[i + 1] !== ' ') {
        parts.push(<em key={`${keyPrefix}i${key++}`}>{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    // inline code: `code`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        parts.push(<code key={`${keyPrefix}c${key++}`}>{text.slice(i + 1, end)}</code>);
        i = end + 1;
        continue;
      }
    }
    // accumulate plain text until next special char
    let j = i;
    while (j < text.length && text[j] !== '*' && text[j] !== '_' && text[j] !== '`') j++;
    if (j > i) {
      parts.push(text.slice(i, j));
      i = j;
    } else {
      parts.push(text[i]);
      i++;
    }
  }
  return parts;
}

export function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank line — skip
    if (!trimmed) { i++; continue; }

    // heading
    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      const level = h[1].length;
      const content = h[2];
      const Tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
      blocks.push(<Tag key={`h${key++}`} className="md-heading">{renderInline(content, `h${key}-`)}</Tag>);
      i++;
      continue;
    }

    // unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^[-*]\s+/, '');
        items.push(<li key={`li${key++}`}>{renderInline(content, `li${key}-`)}</li>);
        i++;
      }
      blocks.push(<ul key={`ul${key++}`} className="md-list">{items}</ul>);
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+\.\s+/, '');
        items.push(<li key={`li${key++}`}>{renderInline(content, `li${key}-`)}</li>);
        i++;
      }
      blocks.push(<ol key={`ol${key++}`} className="md-list">{items}</ol>);
      continue;
    }

    // paragraph — consume until blank line or list/heading
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={`p${key++}`} className="md-paragraph">
        {renderInline(paraLines.join(' '), `p${key}-`)}
      </p>
    );
  }

  return blocks;
}
