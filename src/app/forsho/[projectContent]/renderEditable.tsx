import { FC, useRef, useEffect } from "react";

type EditableBlockProps = {
  className: string;
  content: string;
  onChange?: (content: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const EditableBlock: FC<EditableBlockProps> = ({
  className,
  content,
  onChange,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== content) {
      ref.current.innerHTML = content;
    }
  }, [content]);
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
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange?.(e.currentTarget.innerHTML);
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onClick={onClick}
      className={className + " outline-none prose max-w-none"}
      style={{ pointerEvents: "auto" }}
    />
  );
};

export default EditableBlock;