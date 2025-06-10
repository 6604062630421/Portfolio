"use client";
import type { Block } from "@/app/type";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const ContextMenu = ({
  x,
  y,
  onDelete,
  onNew,
  onleave,
  mouseBywindow,
}: {
  x: number;
  y: number;
  onDelete: () => void;
  onNew: (type: Block["type"]) => void;
  onleave: () => void;
  mouseBywindow:number;
}) => {
  useEffect(()=>{
    
  },[])
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bg-white  shadow-md rounded text-sm z-50"
        style={{ top: mouseBywindow <= 20?y-70:y-2, left: x - 2 }}
        onAnimationComplete={(definition) => {
          if (definition === "exit") {
            onleave();
          }
        }}
      >
        <div className="group relative">
          <button className="block px-4 py-2 hover:bg-gray-100 w-full text-left">
            ➕ Add New Below
          </button>
          <div className="absolute left-full bg-white  shadow-md rounded text-sm hidden group-hover:block z-50"
          style={{top:mouseBywindow<=20?-145:0}}
          >
            {["text", "heading", "img", "light-text", "link-box", "column"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => onNew(type as Block["type"])}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left whitespace-nowrap"
                >
                  ➕ {type}
                </button>
              )
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="block px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
        >
          🗑 Delete
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextMenu;
