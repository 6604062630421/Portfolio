"use client";
import { useEffect, useRef, use, useState } from "react";
import BlockEditor from "./blockediotWrap";
import SupabaseService from "@/app/service/supabase";
import { Block } from "@/app/type";
import { v4 as uuidv4 } from "uuid";
const initialBlocks: Block[] = [
  { id: "-1", type: "heading", content: "Welcome to My Page", position: 1 },
];
export default function Page(promiseParams: {
  params: Promise<{ projectContent: string }>;
}) {
  const { projectContent } = use(promiseParams.params);
  const supabase = SupabaseService.getClient();
  const [content, setContent] = useState<Block[]>([]);
  const [isloading, setloading] = useState(true);
  const [originalId, setOriginalId] = useState<Set<string>>(new Set());
  const [editedId, setEditedId] = useState<Set<string>>(new Set());
  const [editedBlock, setEditedBlock] = useState<Block[]>([]);
  const [currentId, setCurrentId] = useState<string | null>();
  useEffect(() => {
    const fectingContent = async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*,project!inner(id,project)")
        .eq("project.project", projectContent);
      if (error) {
        console.log(error);
      } else {
        if (data.length === 0) {
          const newId = uuidv4();
          const initblock: Block[] = [
            {
              id: newId,
              type: "heading",
              content: "Welcome to My Page",
              position: 1,
            },
          ];
          setEditedBlock(initblock);
          setContent(initblock);
          setloading(false);
        } else {
          setCurrentId(data[0]?.project_id ?? null);
          const newblock: Block[] = data.map((item) => {
            const baseblock = {
              id: item.id,
              type: item.type,
              position: item.position,
            };
            switch (item.type) {
              case "text":
              case "light-text":
              case "heading":
                return {
                  ...baseblock,
                  content: item.content,
                };
              case "img":
                return {
                  ...baseblock,
                  content: item.content.content,
                };
              case "link-box":
                return {
                  ...baseblock,
                  content: item.content.content,
                  href: item.content.href,
                };
              case "column":
                return {
                  ...baseblock,
                  column: Array.isArray(item.content.content)
                    ? item.content.content
                    : [],
                  aspect: item.content.aspect ?? [50, 50],
                };
              default:
                throw new Error("unknow type" + item.type);
            }
          });
          console.log(newblock);
          setContent(newblock);
          setOriginalId((prev) => {
            const newSet = new Set(prev);
            newblock.forEach((item) => newSet.add(item.id));
            return newSet;
          });
          setloading(false);
        }
      }
    };
    fectingContent();
  }, []);
  useEffect(() => {
    console.log(editedBlock);
  }, [editedBlock]);
  useEffect(() => {
    console.log(currentId);
    const fetchingProject = async () => {
      const { data, error } = await supabase
        .from("project")
        .select("id")
        .eq("project", projectContent);
      if (error) {
        console.log(error);
      } else {
        console.log(data[0]?.id);
        setCurrentId(data[0]?.id);
      }
    };
    if (currentId === undefined || null) {
      fetchingProject();
    }
  }, [currentId]);
  const handleonPrepare = (block: Block[], id: Set<string>) => {
    console.log(block);
    console.log(id);
    setEditedBlock(block);
    setEditedId(id);
  };
  const handleSave = async () => {
    const EditedId = new Set(editedBlock.map((item) => item.id));
    console.log(EditedId);
    let removedId = [...originalId].filter((id) => !EditedId.has(id));
    let addedId = [...EditedId].filter((id) => !originalId.has(id));
    let updatedid = [...editedId];
    console.log(removedId, addedId, updatedid);
    if (addedId.length > 0) {
      console.log(editedBlock);
      console.log(addedId);
      const addedItem = editedBlock
        .filter((item) => addedId.includes(item.id))
        .map((item) => {
          switch (item.type) {
            case "text":
            case "light-text":
            case "heading":
              return {
                id: item.id,
                type: item.type,
                content: item.content,
                position: item.position,
                project_id: currentId,
              };
            case "img":
              return {
                id: item.id,
                type: item.type,
                content: item.content,
                position: item.position,
                project_id: currentId,
              };
            case "link-box":
              return {
                id: item.id,
                type: item.type,
                content: {
                  content: item.content,
                  href: item.href,
                },
                position: item.position,
                project_id: currentId,
              };
            case "column":
              return {
                id: item.id,
                type: item.type,
                content: {
                  aspect: item.aspect,
                  content: item.column,
                },
                position: item.position,
                project_id: currentId,
              };
          }
        });
      console.log(addedItem);
      const { error } = await supabase.from("content").upsert(addedItem);
      if (error) {
        console.log(error);
        return;
      }
      console.log("added");
      addedId = [];
    }

    if (updatedid.length > 0) {
      console.log(editedBlock);
      for (let i = 0; i < updatedid.length; i++) {
        const id = updatedid[i];
        const item = editedBlock
          .filter((i) => i.id === id)
          .map((b) => {
            switch (b.type) {
              case "text":
              case "light-text":
              case "heading":
                return {
                  id: b.id,
                  type: b.type,
                  content: b.content ,
                  position: b.position,
                  project_id: currentId,
                };
              case "img":
                return {
                  id: b.id,
                  type: b.type,
                  content: b.content,
                  position: b.position,
                  project_id: currentId,
                };
              case "link-box":
                return {
                  id: b.id,
                  type: b.type,
                  content: {
                    content: b.content,
                    href: b.href,
                  },
                  position: b.position,
                  project_id: currentId,
                };
              case "column":
                return {
                  id: b.id,
                  type: b.type,
                  content: {
                    aspect: b.aspect,
                    content: b.column,
                  },
                  position: b.position,
                  project_id: currentId,
                };
              default:
                return null;
            }
          })
          .filter(Boolean);
        console.log(id, item);
        const { error } = await supabase
          .from("content")
          .update(item)
          .eq("id", id);
        if (error) {
          console.log(error);
          return;
        }
      }
      console.log("updated");
      updatedid = [];
      setEditedBlock([]);
    }

    if (removedId.length > 0) {
      const { error } = await supabase
        .from("content")
        .delete()
        .in("id", removedId);
      if (error) {
        console.log(error);
        return;
      }
      console.log("removed");
      removedId = [];
    }
  };
  return (
    <div className="h-screen w-screen overflow-x-hidden custom-scroll">
      <div
        className="fixed bg-black/50 w-10 h-10 rounded-[100px] bottom-5 right-5 z-50 cursor-pointer hover:bg-black/75 transition-colors"
        onClick={handleSave}
      ></div>
      <div className="bg-red-300 flex justify-center w-full">
        <div className="bg-amber-200 w-[80%] aspect-[13/5]"></div>
      </div>
      <div className="w-full flex justify-center bg-amber-700">
        <div className="w-[70%] bg-amber-100">
          <div className="text-2xl">{projectContent}</div>
          {!isloading && (
            <BlockEditor block={content} onPrepare={handleonPrepare} />
          )}
        </div>
      </div>
    </div>
  );
}
