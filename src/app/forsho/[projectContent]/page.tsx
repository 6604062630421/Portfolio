"use client";
import { useEffect, use, useState } from "react";
import BlockEditor from "./blockediotWrap";
import SupabaseService from "@/app/service/supabase";
import { Block } from "@/app/type";
import { v4 as uuidv4 } from "uuid";
import { GripVertical } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
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
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [coverURL, setCoverURL] = useState<string>();
  const fileref = useRef<HTMLInputElement>(null);
  const [isUploading, setUploading] = useState(false);
  const [UploadErr, setUploadErr] = useState<string | null>(null);
  useEffect(() => {
    const fectingContent = async () => {
      const { data, error } = await supabase
        .from("content")
        .select("*,project!inner(id,project)")
        .eq("project.project", projectContent);

      if (error) {
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
                  content: item.content,
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
          setContent(newblock);
          setOriginalId((prev) => {
            const newSet = new Set(prev);
            newblock.forEach((item) => newSet.add(item.id));
            return newSet;
          });
        }
      }
      setloading(false); // ✅ ปิด loading ก่อน
    };

    fectingContent();

    // ✅ Delay การซ่อน Skeleton อย่างน้อย 200ms
    const delay = setTimeout(() => {
      setShowSkeleton(false);
    }, 200);

    return () => clearTimeout(delay);
  }, []);
  useEffect(() => {
    const fetchingProject = async () => {
      const { data, error } = await supabase
        .from("project")
        .select("id")
        .eq("project", projectContent);
      if (error) {
      } else {
        setCurrentId(data[0]?.id);
      }
    };
    if (currentId === undefined || null) {
      fetchingProject();
      fetchingCover();
    }
  }, [currentId]);

  const handleonPrepare = (block: Block[], id: Set<string>) => {
    setEditedBlock(block);
    setEditedId(id);
  };
  const handleSave = async () => {
    const EditedId = new Set(editedBlock.map((item) => item.id));
    let removedId = [...originalId].filter((id) => !EditedId.has(id));
    let addedId = [...EditedId].filter((id) => !originalId.has(id));
    let updatedid = [...editedId];
    if (addedId.length > 0) {
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
      const { error } = await supabase.from("content").upsert(addedItem);
      if (error) {
        return;
      }
      addedId = [];
    }

    if (updatedid.length > 0) {
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
                  content: b.content,
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
        const { error } = await supabase
          .from("content")
          .update(item)
          .eq("id", id);
        if (error) {
          return;
        }
      }
      updatedid = [];
      setEditedBlock([]);
    }

    if (removedId.length > 0) {
      const { error } = await supabase
        .from("content")
        .delete()
        .in("id", removedId);
      if (error) {
        return;
      }
      removedId = [];
    }
  };
  const handleupload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop();
    const fileName = `${projectContent}.${fileExt}`;
    const localURL = URL.createObjectURL(file);
    setCoverURL(localURL);
    setUploading(true);
    setUploadErr(null);
    const { error } = await supabase.storage
      .from("cover")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      setUploading(false);
      setUploadErr(error.message);
      return;
    }
    const { error: err } = await supabase
      .from("project")
      .upsert(projectContent);
    if (err) {
    }
    setUploading(false);
  };
  const fetchingCover = async () => {
    const { data, error } = await supabase
      .from("project")
      .select("pic")
      .eq("project", projectContent)
      .single();
    if (error) {
      return;
    }
    if (data.pic) {
      const { data: URL } = supabase.storage
        .from("cover")
        .getPublicUrl(data?.pic);
      if (URL) {
        const bustedURL = `${URL.publicUrl}?v=${Date.now()}`;
        setCoverURL(bustedURL);
      }
    }
    else{
      setCoverURL("/haerin.jpg");
    }
  };
  const handleImgClick = () => {
    fileref.current?.click();
  };
  return (
    <div className="h-screen w-screen overflow-x-hidden custom-scroll bg-[#f5f5f5]">
      <div
        className="fixed bg-black/50 w-10 h-10 rounded-[100px] bottom-5 right-5 z-50 cursor-pointer hover:bg-black/75 transition-colors"
        onClick={handleSave}
      ></div>

      <div className="flex justify-center w-full">
        <div
          className="relative  w-[80%] aspect-[13/5] flex justify-center cursor-pointer"
          onClick={handleImgClick}
        >
          {isUploading || UploadErr ? (
            isUploading ? (
              <div>Uploading</div>
            ) : (
              <div>{UploadErr}</div>
            )
          ) : (
            coverURL && (
              <Image
                src={coverURL}
                alt={coverURL || "haerin"}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            )
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileref}
            onChange={handleupload}
          />
        </div>
      </div>

      <div className="w-full flex justify-center ">
        <div className="w-[70%] p-4">
          <div className="text-2xl mb-4">{projectContent}</div>

          {isloading || showSkeleton ? (
            <div className="space-y-2">
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400">
                    <GripVertical size={18} />
                  </div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400">
                    <GripVertical size={18} />
                  </div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
              <div className="z-20 bg-white h-[50px] rounded-[3px] w-full px-3 shadow-sm">
                <div className=" flex items-center h-full w-full gap-3">
                  <div className="text-gray-400">
                    <GripVertical size={18} />
                  </div>
                  <div className="animate-pulse h-6 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <BlockEditor block={content} onPrepare={handleonPrepare} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
