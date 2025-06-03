"use client";
import { useEffect, useRef ,use} from "react";
import BlockEditor from "./blockediotWrap";
import dynamic from "next/dynamic";
export default function Page(promiseParams: { params: Promise<{ projectContent: string }> }) {
  const { projectContent } = use(promiseParams.params);
  return (
    <div className="h-screen w-screen overflow-x-hidden custom-scroll">
        <div className="bg-red-300 flex justify-center w-full">
          <div className="bg-amber-200 w-[80%] aspect-[13/5]"></div>
        </div>
        <div className="w-full flex justify-center bg-amber-700">
          <div className="w-[70%] bg-amber-100">
            <div className="text-2xl">{projectContent}</div>
        <BlockEditor />
          </div>
        </div>
     
    </div>
  );
}