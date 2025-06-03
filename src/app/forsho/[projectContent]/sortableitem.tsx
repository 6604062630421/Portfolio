'use client'
import type { Block } from "@/app/type";
import { GripVertical } from "lucide-react";
import BlockRenderer from "./BlockRenderer";
import { CSS } from '@dnd-kit/utilities';
import {
  useSortable,
} from '@dnd-kit/sortable';
type SortableItemProps = {
  block: Block;
  dragHandle?: boolean;
  onChange?: (id: string, content: string) => void;
  onRightClick?: (e: React.MouseEvent, id: string) => void;
};

const SortableItem = ({ block, dragHandle = true, onChange, onRightClick }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f9f9f9' : '#fff',
    border: isDragging ? '2px dashed #ccc' : 'none',
  };
  
  return (
    <div
      onContextMenu={(e) => onRightClick?.(e, block.id)}
      ref={setNodeRef}
      style={style}
      className="flex gap-2 items-start p-2 rounded mb-2 shadow-sm relative"
    >
      {dragHandle && (
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab text-gray-400 p-1"
        >
          <GripVertical size={18} />
        </div>
      )}
      <div className="flex-1">
        <BlockRenderer block={block} />
      </div>
    </div>
  );
};

export default SortableItem