"use client";
import type { Block } from "@/app/type";
import BlockRenderer from "./BlockRenderer";
const DragPreview = ({ block }: { block: Block }) => (
  <div className="flex gap-2 items-start p-2 rounded mb-2 shadow-sm bg-white w-full">
    <div className="flex-1 opacity-80">
      <BlockRenderer block={block} />
    </div>
  </div>
);

export default DragPreview