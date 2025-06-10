"use client";
// BlockRenderer.tsx
import { FC } from "react";
import { Block } from "@/app/type";
import { useRef,useState } from "react";
import SupabaseService from "@/app/service/supabase";
import EditableBlock from "./renderEditable";
type Props = {
  block: Block;
  onChange?: (id: string, content: string) => void;
};
const BlockRenderer: FC<Props> = ({ block, onChange }) => {
  const supabase = SupabaseService.getClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  
  switch (block.type) {
    case "heading":
    return (
      <EditableBlock
        className="text-2xl font-bold"
        content={block.content}
        onChange={(content) => onChange?.(block.id, content)}
        onClick={handleClick}
      />
    );
  case "text":
    return (
      <EditableBlock
        className="text-base"
        content={block.content}
        onChange={(content) => onChange?.(block.id, content)}
        onClick={handleClick}
      />
    );
  case "light-text":
    return (
      <EditableBlock
        className="text-sm text-gray-500"
        content={block.content}
        onChange={(content) => onChange?.(block.id, content)}
        onClick={handleClick}
      />
    );
    case "img": {

      const handleClickImage = () => {
        inputRef.current?.click();
      };

      const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        const fileExt = file.name.split(".").pop();
        const fileName = `${block.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage
          .from("content")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true, // อัปโหลดทับไฟล์เดิมได้
          });

        if (error) {
          setUploadError(error.message);
          setIsUploading(false);
          console.log(error);
          return;
        }

        const { data } = supabase.storage
          .from("content")
          .getPublicUrl(filePath);
        if (data?.publicUrl) {
          onChange?.(block.id, data.publicUrl);
        }
        setIsUploading(false);
      };

      const src = block.content || "./haerin.jpg";

      return (
        <div
          className="relative w-full h-auto cursor-pointer"
          onClick={handleClickImage}
        >
          <img
            src={src}
            alt={block.alt || ""}
            className={`w-full h-auto ${isUploading ? "opacity-50" : ""}`}
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 text-gray-700 font-semibold">
              กำลังอัปโหลด...
            </div>
          )}
          {uploadError && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-200 text-red-800 text-center p-1 text-xs rounded">
              {uploadError}
            </div>
          )}
        </div>
      );
    }
    case "link-box":
      return (
        <a href={block.href} className="block border p-4 rounded bg-gray-100">
          <h3 className="font-semibold">{block.content}</h3>
        </a>
      );
    case "column":
      const ratio =
        block.aspect && block.aspect.length > 0
          ? `${block.aspect[0]}% ${block.aspect[1]}%`
          : "50% 50%";

      const handleInnerChange = (id: string, content: string) => {
        if (!onChange) return;

        // หา block ที่อยู่ใน column แล้วอัปเดต content
        const updatedColumn = block.column.map((b) =>
          b.id === id ? { ...b, content } : b
        );

        onChange(block.id, JSON.stringify({ ...block, column: updatedColumn }));
      };

      return (
        <div className="grid" style={{ gridTemplateColumns: ratio }}>
          {block.column.map((b) => (
            <BlockRenderer key={b.id} block={b} onChange={handleInnerChange} />
          ))}
        </div>
      );
    default:
      return null;
  }
};
export default BlockRenderer;
