import { useState, useEffect, useMemo } from 'react';
import './ChatThoughts.css';

/**
 * Tree-style chain-of-thoughts panel, mirroring Claude Code's tool-use tree.
 *
 * Layout:
 *   ▾ <title>
 *   │
 *   ├ <tool> <pill: input>
 *   │    <result summary>
 *   ├ <tool> <pill: input>
 *   │    <result summary>
 *
 * Behaviour:
 *  - While `live` is true, the panel is force-expanded and shows a spinner
 *    in the header; the tree updates as new tool calls stream in.
 *  - When `live` flips to false, the panel auto-collapses back to just the
 *    header. The user can click the chevron to re-open it.
 */
function ChatThoughts({ steps, live }) {
  const [open, setOpen] = useState(live);
  const [showAll, setShowAll] = useState(false);

  // Keep expanded while live, auto-collapse on finish.
  useEffect(() => {
    setOpen(live);
  }, [live]);

  const rows = useMemo(() => buildRows(steps || []), [steps]);

  const skillsUsed = useMemo(() => {
    const set = new Set();
    for (const s of steps || []) {
      if (s.type === 'tool_use' && s.skill) set.add(s.skill);
    }
    return [...set];
  }, [steps]);

  if (!live && (!steps || steps.length === 0)) return null;

  const title = live
    ? (skillsUsed.length > 0
        ? `Using ${skillsUsed[skillsUsed.length - 1]}…`
        : 'Thinking…')
    : buildDoneTitle(rows);

  // Collapse long chains while not live: show first 3, hide the rest behind "Show N more".
  const COLLAPSE_AFTER = 3;
  const hideRest = !live && !showAll && rows.length > COLLAPSE_AFTER + 1;
  const visibleRows = hideRest ? rows.slice(0, COLLAPSE_AFTER) : rows;
  const hiddenCount = rows.length - visibleRows.length;

  return (
    <div className={`chat-thoughts ${live ? 'chat-thoughts-live' : ''}`}>
      <button
        type="button"
        className="chat-thoughts-header"
        onClick={() => setOpen(o => !o)}
      >
        <svg
          className={`chat-thoughts-chevron ${open ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 3l4 3-4 3" />
        </svg>
        <span className={`chat-thoughts-title ${live ? 'shimmer' : ''}`}>{title}</span>
      </button>

      {open && rows.length > 0 && (
        <div className="chat-thoughts-tree">
          {visibleRows.map((row, i) => (
            <ThoughtRow key={i} row={row} />
          ))}
          {hideRest && (
            <button
              type="button"
              className="chat-thoughts-more"
              onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
            >
              Show {hiddenCount} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ThoughtRow({ row }) {
  if (row.kind === 'reasoning') {
    return (
      <div className="thought-item thought-item-reasoning">
        <div className="thought-item-line">
          <span className="thought-tool">Thinking</span>
        </div>
        <div className="thought-result thought-reasoning-text">{row.text}</div>
      </div>
    );
  }

  return (
    <div className="thought-item">
      <div className="thought-item-line">
        <span className="thought-tool">{row.skill || row.name}</span>
        {row.input && Object.keys(row.input).length > 0 && (
          <span className="thought-pill" title={formatInputFull(row.input)}>
            {formatInputShort(row.input)}
          </span>
        )}
      </div>
      {row.summary ? (
        <div className="thought-result">{row.summary}</div>
      ) : (
        <div className="thought-result thought-running">running…</div>
      )}
    </div>
  );
}

function formatInputShort(input) {
  if (!input || typeof input !== 'object') return '';
  const parts = Object.entries(input).map(([k, v]) => {
    const val = typeof v === 'string' ? v : JSON.stringify(v);
    return val.length > 40 ? `${val.slice(0, 37)}…` : val;
  });
  const joined = parts.join(' · ');
  return joined.length > 60 ? `${joined.slice(0, 57)}…` : joined;
}

function formatInputFull(input) {
  if (!input || typeof input !== 'object') return '';
  return Object.entries(input)
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join(' · ');
}

function buildDoneTitle(rows) {
  const toolRows = rows.filter(r => r.kind === 'tool');
  if (toolRows.length === 0) return 'Chain of thought';
  if (toolRows.length === 1) return `Used ${toolRows[0].skill || toolRows[0].name}`;
  return `Used ${toolRows.length} tools`;
}

function buildRows(steps) {
  const rows = [];
  const byId = new Map();

  for (const step of steps) {
    if (step.type === 'reasoning') {
      rows.push({ kind: 'reasoning', text: step.text });
    } else if (step.type === 'tool_use') {
      const row = {
        kind: 'tool',
        id: step.id,
        name: step.name,
        skill: step.skill,
        icon: step.icon,
        input: step.input,
        summary: null,
      };
      byId.set(step.id, row);
      rows.push(row);
    } else if (step.type === 'tool_result') {
      const row = byId.get(step.id);
      if (row) row.summary = step.summary;
    }
  }
  return rows;
}

export default ChatThoughts;
