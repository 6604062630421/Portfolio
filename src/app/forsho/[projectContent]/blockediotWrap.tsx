// components/BlockEditorWrapper.tsx
"use client";
import dynamic from "next/dynamic";

const BlockEditor = dynamic(() => import("./blockeditor"), {
  ssr: false, // ❗️ปิด SSR
  loading:()=><div>loadomg</div>
});

export default BlockEditor;