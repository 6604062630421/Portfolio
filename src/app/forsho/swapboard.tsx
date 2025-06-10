import { useEffect, useRef, useState, useMemo, FC } from "react";
import { Swapy, SlotItemMapArray, utils } from "swapy";
import { createSwapy } from "swapy";
import { Pencil } from "lucide-react";
import "./style.css";
import CoverEdit from "./CoverEdit";
import { AnimatePresence, motion } from "framer-motion";
import SupabaseService from "../service/supabase";
import type { Cover, CoverEdit as CoverItem, typeProject, typeTag } from "../type";

type SwapperProp = {
  isOpen: boolean;
  cover: Cover[];
  itemLength: number;
  id: number;
  allproject : typeProject[];
  alltag : typeTag[];
  onUpdate: (updatecover: Cover[], itemlen: number, id: number,editId:Set<string>,drag:boolean) => void;
  onSwapUpdate: (updatecover: Cover[], itemlen: number, id: number,editId:Set<string>) => void;
};
const SwapperBoard: FC<SwapperProp> = ({
  cover,
  itemLength,
  id,
  onUpdate,
  isOpen,
  alltag,
  allproject,
  onSwapUpdate,
}) => {
  //Swappy
  const [items, setItems] = useState<Cover[]>(cover);
  const [itemlen, setItemlen] = useState<number>(itemLength);
  const [maxid, setMaxid] = useState<number>(id);
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
  const [selectedcover, setselectedcover] = useState<Cover>();
  const [isDrag,setDrag] = useState(false);
  const MotionIconPencil = motion.create(Pencil);
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
    if (!isOpen || !containerRef.current) return;
    if(swapyRef.current){
      swapyRef.current?.destroy();
    }
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
      let slotid:string
      const dragged = event.draggingItem;
      const newSlotArr = event.newSlotItemMap.asArray;
      const updatedItems = items.map((item) => {
        const newIndex = newSlotArr.findIndex(
          (slotItem) => {
            console.log("fromslot"+item.id)
            setIdThatEdited((prev) => new Set(prev).add(item.id));
            slotid = item.id;
            return slotItem.item === item.id}
        );
        return {
          ...item,
          position: newIndex + 1,
        };
      });
      const draddedItem = items.find((i) => i.id === dragged);
      const newIndex = newSlotArr.findIndex((s) => s.item === dragged);
      if (draddedItem) {
        console.log(`Dragged ${draddedItem.id} to slot ${newIndex}`);
        setIdThatEdited((prev) => new Set(prev).add(draddedItem.id));
        setDrag(true);
      }
      setItems(updatedItems);
      setSlotItemMap(newSlotArr);
      return ()=>{
        swapyRef.current?.destroy();
        swapyRef.current = null;
      }
    });
  }, [isOpen,items.length]);
  useEffect(()=>{
    console.log(items)
  },[items.length])
  const addItem = async():Promise<Cover> => {
    const localItemLen = itemlen + 1;
    const localMaxId = maxid + 1;
    const newItem: Cover = {
      id: `${localMaxId}`,
      pic: "./haerin.jpg",
      position: localItemLen,
      project: {
        project: "",
        tag: [],
      },
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setSlotItemMap(utils.initSlotItemMap(newItems, "id"));
    setItemlen(localItemLen);
    setMaxid(localMaxId);
    return newItem;
  };

  const removeItem = (idToDelete: string) => {
    const updatedItems = items.filter((i) => i.id !== idToDelete);
    const reindexedItems = updatedItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    setItems(reindexedItems);
    setSlotItemMap(utils.initSlotItemMap(reindexedItems, "id"));
    setItemlen((prev) => prev - 1);
  };
  const handleSelectItem = (id: string) => {
    setselectedcover(items.find((item) => item.id === id));
    setShow(true);
  };
  const handleAddandEdit = async () =>{
    const newId = await addItem();
    setselectedcover(newId);
    setShow(true);
  }
  const handleEdit = (coverEdited: CoverItem) => {
    if (
      !coverEdited.image ||
      !coverEdited.Project ||
      !coverEdited.Tag ||
      !selectedcover?.id
    ) {
      return;
    } else {
      const tagArr = coverEdited.Tag?.split(",").map((tag) => tag.trim());
      const updatingItem = items.map((item) =>
        item.id === selectedcover.id
          ? {
              ...item,
              pic: coverEdited.image ?? "",
              project: { project: coverEdited.Project ?? "", tag: tagArr },
            }
          : item
      );
      console.log(updatingItem);
      setItems(updatingItem);
    }
  };
  const [IdThatEdited, setIdThatEdited] = useState<Set<string>>(new Set());
  const setIdEdited = (value: string) => {
    console.log(value);
    setIdThatEdited((prev) => new Set(prev).add(value));
  };
  useEffect(() => {
    console.log(IdThatEdited);
  }, [IdThatEdited]);
  //tag+project 
  const [allTag,setAlltag] = useState<typeTag[]>(alltag);
  const [allProject,setAllProject] = useState<typeProject[]>(allproject);
  const handleEditBFswapt = ()=>{
    setShow(false)
    onSwapUpdate(items, itemlen, maxid,IdThatEdited);
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={(definition) => {
            if (definition === "exit") {
              console.log("animatecomplete");
            }
          }}
          onClick={() => onUpdate(items, itemlen, maxid,IdThatEdited,isDrag)}
          className="fixed w-[100vw] h-[100vh] bg-black/50 justify-center flex items-center z-50 inset-0"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-[90%] xl:w-[47.5%] h-[95%] rounded-xl bg-white px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-7 pb-5 border-black/50 border-b-1 mb-10 flex justify-between">
              <h1 className="text-[32px] ">Swapboard</h1>
              <div
                  className="item--add items-center justify-center rounded-[5px] relative flex flex-col bg-transparent w-30 bg border-4 border-[#4338ca] cursor-pointer select-none hover:bg-[#4338ca3d]"
                  onClick={handleAddandEdit}
                >
                  +
                </div>
            </div>
            <div
              className="w-full h-[80%] overflow-auto"
              style={{ scrollbarGutter: "stable" }}
            >
              {show && (
                <CoverEdit
                  onClose={handleEditBFswapt}
                  isOpen={show}
                  selectedCover={selectedcover}
                  onExit={handleEdit}
                  isUpdate={setIdEdited}
                  alltag={allTag}
                  allproject={allProject}
                />
              )}
              <div
                className="max-w-[800px] w-full flex flex-col gap-[10px] mx-auto"
                ref={containerRef}
              >
                <div className="grid gap-[10px] md:grid-cols-3 bg-fuchsia-200 grid-cols-1 ">
                  {slottedItems.map(({ slotId, itemId, item }) => (
                    <div
                      className="slot h-fit"
                      key={slotId}
                      data-swapy-slot={slotId}
                    >
                      {item && (
                        <div
                          className="item cursor-grab active:cursor-grabbing select-none inline-block overflow-clip"
                          data-swapy-item={itemId}
                          key={itemId}
                        >
                          <span
                            className="delete z-10"
                            data-swapy-no-drag
                            onClick={() => removeItem(item.id)}
                          ></span>
                          <img
                            src={`${item.pic}`}
                            className="h-auto select-none"
                            draggable={false}
                          />
                          <div className="py-1 flex justify-between mx-2">
                            <span>
                              {item.project.project}+{slotId}+{item.id}{" "}
                              position: {item.position}
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
                                onClick={() => handleSelectItem(item.id)}
                              />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwapperBoard;
