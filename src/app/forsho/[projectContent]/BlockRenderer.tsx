'use client';
// BlockRenderer.tsx
import { FC } from "react";
import { Block } from "@/app/type";

type Props = {
  block: Block;
  onChange?:(id:string,content:string) =>void;
};

const BlockRenderer: FC<Props> = ({ block, onChange }) => {
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange?.(block.id, e.currentTarget.innerHTML); // Save HTML for link support
  };
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const target = e.target as HTMLElement;
  if (target.tagName === "A") {
    e.preventDefault();
    const href = target.getAttribute("href");
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }
};
function convertHtmlToMarkdown(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  const walk = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === "A") {
        const href = el.getAttribute("href") || "";
        const text = el.textContent || "";
        return `[${text}](${href})`;
      }

      // Recursively walk through children
      return Array.from(node.childNodes).map(walk).join("");
    }

    return "";
  };

  return Array.from(div.childNodes).map(walk).join("");
}
const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
  const text = e.clipboardData.getData("text");

  if (/^https?:\/\/\S+$/.test(text)) {
    e.preventDefault();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText) {
      const anchorHtml = `<a href="${text}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${selectedText}</a>`;
      document.execCommand("insertHTML", false, anchorHtml);

      // ✅ เก็บ reference ของ target div
      const container = e.currentTarget;

      setTimeout(() => {
        if (!container) return;

        const html = container.innerHTML;
        const markdown = convertHtmlToMarkdown(html);

        console.log(markdown);
      }, 0);
    }
  }
};

  // This util helps to return editable div
const renderEditableBlock = (
  className: string,
  content: string
) => (
  <div
    contentEditable
    suppressContentEditableWarning
    onInput={handleInput}
    onPaste={handlePaste}
    onClick={handleClick}
    className={className + " outline-none prose max-w-none"}
    style={{ pointerEvents: "auto" }} // Allow links inside to be interactive
    dangerouslySetInnerHTML={{ __html: content }}
    
  />
);

  switch (block.type) {
    case "heading":
      return renderEditableBlock("text-2xl font-bold", block.content);
    case "text":
      return renderEditableBlock("text-base", block.content);
    case "light-text":
      return renderEditableBlock("text-sm text-gray-500", block.content);
    case "img":
      return <img src={block.content} alt={block.alt || ""} className="w-full h-auto" />;
    case "link-box":
      return (
        <a href={block.href} className="block border p-4 rounded bg-gray-100">
          <h3 className="font-semibold">{block.content}</h3>
        </a>
      );
    case "column":
      const ratio = block.aspect ? `${block.aspect[0]}% ${block.aspect[1]}%` : '50% 50%';
      return (
        <div className="grid" style={{ gridTemplateColumns: ratio }}>
          {block.column.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </div>
      );
    default:
      return null;
  }
};
export default BlockRenderer;