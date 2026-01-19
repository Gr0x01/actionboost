import React from "react";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Lightweight markdown renderer for results content.
 * Handles: headers (###), bold (**), italic (*), lists (- or *), numbered lists, paragraphs, horizontal rules
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
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

  // Render inline markdown: **bold**, *italic*, `code`
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      // Bold: **text** - match non-greedy, allowing any chars except ** sequence
      // Use a more explicit pattern that handles common cases
      const boldMatch = remaining.match(/\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/);

      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before the bold match
        if (boldMatch.index > 0) {
          parts.push(renderItalic(remaining.slice(0, boldMatch.index), partKey++));
        }
        // Add the bold text
        parts.push(
          <strong key={partKey++} className="font-semibold text-foreground">
            {renderItalic(boldMatch[1], partKey++)}
          </strong>
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // No more bold patterns, render rest with italic check
      parts.push(renderItalic(remaining, partKey++));
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

    // Empty line - flush list and add spacing
    if (!trimmed) {
      flushList();
      continue;
    }

    // H3: ### Header - prominent subsection headers
    if (trimmed.startsWith("### ")) {
      flushList();
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

  return <div className={className}>{elements}</div>;
}
