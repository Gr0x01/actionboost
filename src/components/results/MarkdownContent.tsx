import React from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** Enable extended markdown features like tables and code blocks */
  extended?: boolean;
}

/**
 * Lightweight markdown renderer for results content.
 * Handles: headers (###), bold (**), italic (*), lists (- or *), numbered lists, paragraphs, horizontal rules
 * Extended mode adds: tables, code blocks
 */
export function MarkdownContent({ content, className = "", extended = false }: MarkdownContentProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let currentCodeBlock: { lang: string; lines: string[] } | null = null;
  let keyIndex = 0;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type;
      elements.push(
        <ListTag
          key={keyIndex++}
          className={`mb-6 ${currentList.type === "ol" ? "list-decimal" : "list-disc"} list-outside ml-5 space-y-2`}
        >
          {currentList.items.map((item, i) => (
            <li key={i} className="text-foreground/80 pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  const flushTable = () => {
    if (currentTable && extended) {
      elements.push(
        <div key={keyIndex++} className="mb-6 overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {currentTable.headers.map((header, i) => (
                  <th key={i} className="px-4 py-2 text-left font-semibold text-foreground bg-surface/50">
                    {renderInline(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border/50">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-foreground/80">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  const flushCodeBlock = () => {
    if (currentCodeBlock && extended) {
      elements.push(
        <pre key={keyIndex++} className="mb-6 p-4 rounded-lg bg-surface border border-border overflow-x-auto">
          <code className="text-sm font-mono text-foreground/90 whitespace-pre">
            {currentCodeBlock.lines.join("\n")}
          </code>
        </pre>
      );
      currentCodeBlock = null;
    }
  };

  // Render inline markdown: **bold**, *italic*, `code`, [links](url)
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      // Find the first match of any inline pattern
      const boldMatch = remaining.match(/\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/);
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      // Determine which match comes first
      const boldIndex = boldMatch?.index ?? Infinity;
      const linkIndex = linkMatch?.index ?? Infinity;

      // Link: [text](url)
      if (linkMatch && linkIndex <= boldIndex && linkMatch.index !== undefined) {
        if (linkMatch.index > 0) {
          parts.push(renderBoldAndItalic(remaining.slice(0, linkMatch.index), partKey++));
        }
        parts.push(
          <a
            key={partKey++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
        continue;
      }

      // Bold: **text**
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(renderItalic(remaining.slice(0, boldMatch.index), partKey++));
        }
        parts.push(
          <strong key={partKey++} className="font-semibold text-foreground">
            {renderItalic(boldMatch[1], partKey++)}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // No more patterns, render rest with italic check
      parts.push(renderItalic(remaining, partKey++));
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  // Helper for text that may contain bold and italic (used before links)
  const renderBoldAndItalic = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(renderItalic(remaining.slice(0, boldMatch.index), baseKey * 100 + partKey++));
        }
        parts.push(
          <strong key={`${baseKey}-b-${partKey++}`} className="font-semibold text-foreground">
            {renderItalic(boldMatch[1], baseKey * 100 + partKey++)}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      parts.push(renderItalic(remaining, baseKey * 100 + partKey++));
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  // Handle italic *text* (single asterisk)
  const renderItalic = (text: string, baseKey: number): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      // Match *text* - single asterisks, not double
      // Look for * followed by non-* content followed by *
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);

      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(<span key={`${baseKey}-${partKey++}`}>{remaining.slice(0, italicMatch.index)}</span>);
        }
        parts.push(
          <em key={`${baseKey}-${partKey++}`} className="italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No italic found, return plain text
      parts.push(<span key={`${baseKey}-${partKey++}`}>{remaining}</span>);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Extended: Code block handling
    if (extended) {
      // Code block start: ```lang
      if (trimmed.startsWith("```") && !currentCodeBlock) {
        flushList();
        flushTable();
        currentCodeBlock = { lang: trimmed.slice(3), lines: [] };
        continue;
      }
      // Code block end
      if (trimmed === "```" && currentCodeBlock) {
        flushCodeBlock();
        continue;
      }
      // Inside code block
      if (currentCodeBlock) {
        currentCodeBlock.lines.push(line); // preserve original whitespace
        continue;
      }

      // Table row: | col1 | col2 |
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const cells = trimmed.slice(1, -1).split("|").map(c => c.trim());

        // Table separator row: |---|---|
        if (cells.every(c => /^[-:]+$/.test(c))) {
          continue; // skip separator row
        }

        if (!currentTable) {
          flushList();
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
        continue;
      } else if (currentTable) {
        // Non-table line after table - flush table
        flushTable();
      }
    }

    // Empty line - flush list and add spacing
    if (!trimmed) {
      flushList();
      if (extended) flushTable();
      continue;
    }

    // Skip "Links to:" cross-references (not functional)
    if (/^\*?Links to:/i.test(trimmed)) {
      continue;
    }

    // H2: ## Header - major section headers (extended mode)
    if (extended && trimmed.startsWith("## ") && !trimmed.startsWith("### ")) {
      flushList();
      flushTable();
      elements.push(
        <h2
          key={keyIndex++}
          className="text-2xl font-bold text-foreground mt-14 mb-6 font-sans tracking-tight border-b border-border/30 pb-3"
        >
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    // H3: ### Header - prominent subsection headers
    if (trimmed.startsWith("### ")) {
      flushList();
      if (extended) flushTable();
      elements.push(
        <h3
          key={keyIndex++}
          className="text-lg font-semibold text-foreground mt-10 mb-4 font-sans tracking-tight"
        >
          {trimmed.slice(4)}
        </h3>
      );
      continue;
    }

    // H4: #### Header - smaller subsection headers
    if (trimmed.startsWith("#### ")) {
      flushList();
      elements.push(
        <h4
          key={keyIndex++}
          className="text-base font-medium text-foreground mt-6 mb-3 font-sans"
        >
          {trimmed.slice(5)}
        </h4>
      );
      continue;
    }

    // Horizontal rule: --- or more dashes
    if (/^-{3,}$/.test(trimmed)) {
      flushList();
      elements.push(
        <hr
          key={keyIndex++}
          className="my-10 border-t border-border/40"
        />
      );
      continue;
    }

    // Unordered list: - item or * item (but not **)
    if (/^[-]\s/.test(trimmed) || (/^\*\s/.test(trimmed) && !trimmed.startsWith("**"))) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(trimmed.replace(/^[-*]\s*/, ""));
      continue;
    }

    // Ordered list: 1. item
    if (/^\d+\.\s/.test(trimmed)) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(trimmed.replace(/^\d+\.\s*/, ""));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={keyIndex++} className="mb-4 text-foreground/80 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  if (extended) {
    flushTable();
    flushCodeBlock();
  }

  return <div className={className}>{elements}</div>;
}
