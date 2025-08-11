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
import { FC, useEffect, useState } from "react";
import { Block } from "@/app/type";
import DragPreview from "./dragpreview";
import SortableItem from "./sortableitem";
import ContextMenu from "./contextmenu";
import { v4 as uuidv4 } from "uuid";
const initialBlocks: Block[] = [
  { id: "-1", type: "heading", content: "Welcome to My Page", position: 1 },
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
  aspect?: number[] | undefined;
};
type blockEditor = {
  block: Block[];
  onPrepare: (bl: Block[], editedId: Set<string>) => void;
};
let mouseBywindow: number;

const BlockEditor: FC<blockEditor> = ({ block, onPrepare }) => {
  const [blocks, setBlocks] = useState<Block[]>(() =>
    updatePositions(
      block.length > 0
        ? block.sort((a, b) => a.position! - b.position!)
        : initialBlocks
    )
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
  const activeBlock = blocks.find((b) => b.id === activeId) || null;
  const [isSelectColumn, setSelectColumn] = useState(false);
  const [dropDownL, setDropDownL] = useState(false);
  const [dropDownR, setDropDownR] = useState(false);
  const [refId, setrefId] = useState("");
  const [handleAspect, setAspect] = useState("");
  const [editedBlock, setEditedBlock] = useState<Set<string>>(new Set());
  const [inscol, setInscol] = useState<insCol>({
    typeL: "text",
    typeR: "text",
    aspect: [],
  });

  const newBlock = (type: string) => {
    const newId = uuidv4();
    let newBlock: Block;

    switch (type) {
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
        newBlock = {
          id: newId,
          type: "text",
          content: "New Text",
          position: 0,
        };
        break;
      case "light-text":
        newBlock = {
          id: newId,
          type: "light-text",
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
          content: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
          position: 0,
        };
        break;
      default:
        throw new Error("Unknown block type");
    }
    return newBlock;
  };

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
    setEditedBlock((prev) => {
      const updated = new Set(prev);
      updated.add(active.id as string);
      updated.add(over.id as string);
      return updated;
    });
    setActiveId(null);
  };

  const handleContentChange = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? block.type === "column"
            ? { ...block, ...JSON.parse(content) } // กรณีอัปเดตจาก column
            : { ...block, content }
          : block
      )
    );
    setEditedBlock((prev) => {
      const newEdit = new Set(prev);
      newEdit.add(id);
      console.log(newEdit);
      return newEdit;
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);
  useEffect(() => {
    console.log(blocks);
    onPrepare(blocks, editedBlock);
  }, [blocks, editedBlock.size]);
  useEffect(() => {
    const handlemousemove = (e: MouseEvent) => {
      mouseBywindow = 100 - (e.clientY / window.innerHeight) * 100;
    };
    window.addEventListener("mousemove", handlemousemove);
    return () => window.removeEventListener("mousemove", handlemousemove);
  }, []);

  return (
    <div className="relative ">
      {isSelectColumn && (
        <div className="w-full h-full flex justify-center items-center z-10 fixed top-0 left-0">
          <div className="absolute z-50 w-[80%] h-[10%] bg-white shadow-2xl rounded-[3px] p-3 flex justify-between">
            <div
              className="group w-[20%] bg-red-300 h-[50%]"
              onMouseEnter={() => setDropDownL(true)}
            >
              {inscol.typeL}
              {dropDownL && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white translate-y-3">
                  {["text", "heading", "img", "light-text", "link-box"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setInscol((prev) => ({ ...prev, typeL: type }));
                          setDropDownL(false);
                        }}
                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left whitespace-nowrap"
                      >
                        ➕ {type}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            <div
              className="group w-[20%] bg-red-300 h-[50%]"
              onMouseEnter={() => setDropDownR(true)}
            >
              {inscol.typeR}
              {dropDownR && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white translate-y-3 ">
                  {["text", "heading", "img", "light-text", "link-box"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setInscol((prev) => ({ ...prev, typeR: type }));
                          setDropDownR(false);
                        }}
                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left whitespace-nowrap"
                      >
                        ➕ {type}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            <form>
              <label>aspect:</label>
              <input
                type="text"
                placeholder="50,50"
                value={handleAspect}
                onChange={(e) => {
                  setAspect(e.currentTarget!.value);
                }}
              />
            </form>
            <div
              onClick={() => {
                const value = handleAspect || "";
                const parsed = value
                  .split(",")
                  .map((v) => parseInt(v.trim(), 10))
                  .filter((v) => !isNaN(v));
                setInscol((prev) => {
                  return {
                    ...prev,
                    aspect: parsed,
                  };
                });
                const newId = uuidv4();
                const blockL = newBlock(inscol.typeL);
                const blockR = newBlock(inscol.typeR);
                const newaddBlock: Block = {
                  id: newId,
                  type: "column",
                  column: [blockL, blockR],
                  position: 0,
                  aspect: parsed,
                };
                console.log(newaddBlock);
                setBlocks((prev) => {
                  const index = prev.findIndex((b) => b.id === refId);
                  const newBlocks = [...prev];
                  newBlocks.splice(index + 1, 0, newaddBlock);
                  return updatePositions(newBlocks);
                });
                setSelectColumn(false);
              }}
            >
              ok
            </div>
            <div onClick={() => setSelectColumn(false)}>x</div>
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
          {blocks.map((block) => (
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
            mouseBywindow={mouseBywindow}
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
                    content:
                      "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
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
              setrefId(contextMenu.blockId);
              setContextMenu(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BlockEditor;
