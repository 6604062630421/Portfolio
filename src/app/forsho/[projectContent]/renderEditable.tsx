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