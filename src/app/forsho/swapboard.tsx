import { useEffect, useRef, useState, useMemo } from "react";
import { Swapy, SlotItemMapArray, utils } from "swapy";
import { createSwapy } from "swapy";
import { Pen, Pencil } from "lucide-react";
import "./style.css";
import CoverEdit from "./CoverEdit";
import { motion } from "framer-motion";
type Item = {
  id: string;
  title: string;
  position: number;
  project: string;
};
const initialItems: Item[] = [
  { id: "1", title: "a", position: 1, project: "1" },
  { id: "2", title: "b", position: 2, project: "1" },
  { id: "3", title: "c", position: 3, project: "1" },
];

let id = initialItems.length;
let itemLength = initialItems.length;
function SwapperBoard() {
  //Swappy
  const [items, setItems] = useState<Item[]>(
    initialItems.sort((a, b) => a.position - b.position)
  );
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(
    utils.initSlotItemMap(items, "id")
  );
  const slottedItems = useMemo(
    () => utils.toSlottedItems(items, "id", slotItemMap),
    [items, slotItemMap]
  );
  const swapyRef = useRef<Swapy | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  //swappy

  const [show, setShow] = useState<boolean>(false);
  const MotionIconPencil = motion(Pencil);

  useEffect(() => {
    if (swapyRef.current) {
      utils.dynamicSwapy(
        swapyRef.current,
        items,
        "id",
        slotItemMap,
        setSlotItemMap
      );
    }
  }, [items]);
  useEffect(() => {
    console.log(items);
  }, [items]);
  useEffect(() => {
    if (!containerRef.current) return;
    swapyRef.current?.destroy();
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    });
    swapyRef.current.onSwap((event) => {
      console.log(id);
      const dragged = event.draggingItem;
      const newSlotArr = event.newSlotItemMap.asArray;
      const updatedItems = items.map((item) => {
        const newIndex = newSlotArr.findIndex(
          (slotItem) => slotItem.item === item.id
        );
        return {
          ...item,
          position: newIndex + 1,
        };
      });
      setItems(updatedItems);
      setSlotItemMap(newSlotArr);

      const draddedItem = items.find((i) => i.id === dragged);
      const newIndex = newSlotArr.findIndex((s) => s.item === dragged);
      if (draddedItem) {
        console.log(`Dragged ${draddedItem.title} to slot ${newIndex + 1}`);
      }
    });
  }, [items.length]);
  useEffect(() => {
    console.log(slotItemMap);
  }, [slotItemMap]);

  const addItem = () => {
    id++;
    itemLength++;
    const newItem: Item = {
      id: `${id}`,
      title: `${id}`,
      position: itemLength,
      project: "1",
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setSlotItemMap(utils.initSlotItemMap(newItems, "id"));
  };

  const removeItem = (idToDelete: string) => {
    const updatedItems = items.filter((i) => i.id !== idToDelete);
    const reindexedItems = updatedItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    setItems(reindexedItems);
    setSlotItemMap(utils.initSlotItemMap(reindexedItems, "id"));
    itemLength--;
  };

  return (
    <div>
      {show && <CoverEdit onClose={() => setShow(false)} isOpen={show} />}
      <div
        className="max-w-[800px] w-full flex flex-col gap-[10px] mx-auto"
        ref={containerRef}
      >
        <div className="grid gap-[10px] md:grid-cols-3 bg-fuchsia-200 grid-cols-1 ">
          {slottedItems.map(({ slotId, itemId, item }) => (
            <div className="slot h-fit" key={slotId} data-swapy-slot={slotId}>
              {item && (
                <div
                  className="item cursor-grab active:cursor-grabbing select-none inline-block overflow-clip"
                  data-swapy-item={itemId}
                  key={itemId}
                >
                  <span
                    className="delete z-1"
                    data-swapy-no-drag
                    onClick={() => removeItem(item.id)}
                  ></span>
                  <img
                    src="/haerin.jpg"
                    className="h-auto select-none"
                    draggable={false}
                  />
                  <div className="py-1 flex justify-between mx-2">
                    <span>
                      {item.title}+{slotId}+{itemId}+{item.id} position:{" "}
                      {item.position}
                    </span>
                    <span className="flex items-center">
                      <MotionIconPencil
                        initial={{ strokeWidth: 1.5 }}
                        whileHover={{ rotate: -5, strokeWidth: 2 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                          bounce: 0.2,
                        }}
                        style={{ transformOrigin: "bottom left" }}
                        className="cursor-pointer w-auto h-5"
                        onClick={() => setShow(true)}
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          className="item item--add items-center rounded-[5px]"
          onClick={() => addItem()}
        >
          +
        </div>
      </div>
    </div>
  );
}

export default SwapperBoard;
