"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { Block } from "@/app/type";
import DragPreview from "./dragpreview";
import SortableItem from "./sortableitem";
import ContextMenu from "./contextmenu";
import { v4 as uuidv4 } from "uuid";
const initialBlocks: Block[] = [
  { id: "1", type: "heading", content: "Welcome to My Page", position: 2 },
  { id: "2", type: "text", content: "test", position: 1 },
  {
    id: "3",
    type: "img",
    content: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
    position: 4,
  },
  {
    id: "4",
    type: "column",
    column: [
      { id: "5", type: "text", content: "hi" },
      {
        id: "6",
        type: "img",
        content: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
      },
    ],
    aspect: [30, 70],
    position: 5,
  },
];

const updatePositions = (blocks: Block[]) => {
  return blocks.map((block, index) => ({
    ...block,
    position: index + 1,
  }));
};

type insCol = {
  typeR: string;
  typeL: string;
  aspect?: number[]|undefined;
};
const BlockEditor = () => {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    updatePositions(initialBlocks.sort((a, b) => a.position! - b.position!))
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    blockId: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(prev, oldIndex, newIndex);
      return updatePositions(newBlocks);
    });
    setActiveId(null);
  };

  const handleContentChange = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const activeBlock = blocks.find((b) => b.id === activeId) || null;
  const [isSelectColumn, setSelectColumn] = useState(false);
  const [inscol, setInscol] = useState<insCol>({
    typeL: "text",
    typeR: "text",
    aspect: [],
  });
  return (
    <div className="relative">
      {isSelectColumn && (
        <div className="w-full h-full flex justify-center items-center z-10 fixed top-0 left-0">
          <div className="absolute z-50 w-[80%] h-[10%] bg-white shadow-2xl rounded-[3px] p-3 flex justify-between">
            <div className="group w-[20%]">
              {inscol.typeL}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                {[
                  "text",
                  "heading",
                  "img",
                  "light-text",
                  "link-box",
                  "column",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setInscol((prev) => ({ ...prev, typeL: type }))
                    }
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left whitespace-nowrap"
                  >
                    ➕ {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="group w-[20%] ">
              {inscol.typeR}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white w-[40%]">
                {[
                  "text",
                  "heading",
                  "img",
                  "light-text",
                  "link-box",
                  "column",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setInscol((prev) => ({ ...prev, typeR: type }))
                    }
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left whitespace-nowrap"
                  >
                    ➕ {type}
                  </button>
                ))}
              </div>
              
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>aspect:</label>
              <input
                type="text"
                placeholder="30,70"
                value={inscol.aspect?.join(",")} 
                onChange={(e) => {
                  const value = e.currentTarget?.value || ""; 
                  const parsed = value
                    .split(",")
                    .map((v) => parseInt(v.trim(), 10))
                    .filter((v) => !isNaN(v));
                  setInscol((prev) => ({
                    ...prev,
                    aspect: parsed,
                  }));
                }}
              />
            </form>
            <div onClick={()=>setSelectColumn(false)}>
                x
              </div>
          </div>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block, i) => (
            <div key={block.id}>
              <SortableItem
                key={block.id}
                block={block}
                onChange={handleContentChange}
                onRightClick={(e, id) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    blockId: id,
                  });
                }}
              />
            </div>
          ))}
        </SortableContext>

        <DragOverlay adjustScale={false}>
          {activeBlock ? <DragPreview block={activeBlock} /> : null}
        </DragOverlay>
      </DndContext>

      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent cursor-default"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          ></div>
          <ContextMenu
            key={contextMenu.blockId + contextMenu.x + contextMenu.y}
            onleave={() => setContextMenu(null)}
            x={contextMenu.x}
            y={contextMenu.y}
            onDelete={() => {
              setBlocks((prev) => {
                const filtered = prev.filter(
                  (b) => b.id !== contextMenu.blockId
                );
                return updatePositions(filtered);
              });
              setContextMenu(null);
            }}
            onNew={(type) => {
              const newId = uuidv4();

              let newBlock: Block;

              switch (type) {
                case "column":
                  setSelectColumn(true);
                  newBlock = {
                    id: newId,
                    type: "column",
                    column: [],
                    position: 0,
                  };
                  break;
                case "link-box":
                  newBlock = {
                    id: newId,
                    type: "link-box",
                    content: "New LinkBox",
                    href: "",
                    position: 0,
                  };
                  break;
                case "text":
                case "light-text":
                  newBlock = {
                    id: newId,
                    type: type,
                    content: "New Text",
                    position: 0,
                  };
                  break;
                case "heading":
                  newBlock = {
                    id: newId,
                    type: "heading",
                    content: "New Heading",
                    position: 0,
                  };
                  break;
                case "img":
                  newBlock = {
                    id: newId,
                    type: "img",
                    content: "https://via.placeholder.com/150",
                    position: 0,
                  };
                  break;
                default:
                  throw new Error("Unknown block type");
              }

              if (type !== "column") {
                setBlocks((prev) => {
                  const index = prev.findIndex(
                    (b) => b.id === contextMenu.blockId
                  );
                  const newBlocks = [...prev];
                  newBlocks.splice(index + 1, 0, newBlock);
                  return updatePositions(newBlocks);
                });
              }

              setContextMenu(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BlockEditor;
