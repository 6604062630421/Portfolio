// components/BlockEditorWrapper.tsx
"use client";
import dynamic from "next/dynamic";
import {GripVertical} from 'lucide-react';
const BlockEditor = dynamic(() => import("./blockeditor"), {
  ssr: false, // ❗️ปิด SSR
  loading:()=><div><div className="space-y-2">
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400"><GripVertical size={18}/></div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400"><GripVertical size={18}/></div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400"><GripVertical size={18}/></div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div></div>
});

export default BlockEditor;