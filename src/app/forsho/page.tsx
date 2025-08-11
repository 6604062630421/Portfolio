"use client";
import React, { useEffect, useState } from "react";
import AuthService from "../service/Authservice";
import Loginform from "./loginform";
import { useRef } from "react";
import SwapperBoard from "./swapboard";
import { fetchingCover, fetchingProject, fetchingTag } from "./fetchingCover";
import type { Cover, typeProject, typeTag } from "../type";
import SupabaseService from "../service/supabase";
import Mymasonrygrid from "./masonry";
import Scene from "./threesection/Hero";
import { motion, AnimatePresence } from "framer-motion";
let itemLength: number;
let id: number;

const Page = () => {
  const [showSwapy, setShowSwapy] = useState<boolean>(false);
  const [onload, setOnload] = useState<boolean>(true);
  //loaddatasupabase
  const supabase = AuthService.getInstance();
  const SupabaseServ = SupabaseService.getClient();
  const [user, setUser] = useState<unknown>();
  const [onAnimated, setAnimated] = useState(false);
  const windowRef = useRef(null);
  const authListen = () => {
    const { data: authListener } = supabase.supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setUser(session.user.email);
        } else {
          setUser(null);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  };

  const handleSubmit = async (email: string, pass: string) => {
    const { data, error } = await supabase.login(email, pass);
    if (error) {
      console.log("err", error.message);
    } else {
      console.log(data);
      authListen();
      setUser(data);
      localStorage.setItem("email", email);
    }
  };
  const onLogOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.logout();
  };

  useEffect(() => {
    authListen();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const session = await supabase.getSession();
      if (session) {
        console.log(session);
        setUser(session.user.email);
      } else {
        console.log("no session");
      }
    };
    getSession();
  }, []);
  //loaddatasupabase

  //editdatasupabase
  const [idThatUpdate, setIdThatUpdate] = useState<Set<string>>(new Set());
  const handleUpdate = async () => {
    const updatedId = new Set(cover.map((item) => item.id));
    let removedId = [...originalCover].filter((id) => !updatedId.has(id));
    let addedId = [...updatedId].filter((id) => !originalCover.has(id));
    let editedId = [...idThatUpdate];
    console.log(removedId, addedId, cover, originalCover, editedId);
    if (addedId.length > 0) {
      const addedItem = cover
        .filter((item) => addedId.includes(item.id))
        .map((item) => {
          console.log(item);
          console.log(allProject);
          const projectId = allProject.find(
            (p) => p.name === item.project.project
          )?.id;
          console.log(projectId);
          return {
            id: parseInt(item.id, 10),
            pic: item.pic,
            position: item.position,
            project_id: projectId,
          };
        });
      console.log(addedItem);
      await SupabaseServ.from("cover").upsert(addedItem);
      addedId = [];
    }
    if (removedId.length > 0) {
      const { error } = await SupabaseServ.from("cover")
        .delete()
        .in("id", removedId);
      if (error) {
        console.log(error.message);
      }
      removedId = [];
    }
    if (editedId.length > 0) {
      const editedItem = cover
        .filter((item) => editedId.includes(item.id))
        .map((item) => {
          const projectId = allProject.find(
            (p) => p.name === item.project.project
          )?.id;
          let pic = item.pic;
          if (
            pic.startsWith(
              "https://wkvbmoddmccxnxcieprm.supabase.co/storage/v1/object/public/cover/"
            )
          ) {
            pic = pic.split("/").pop() || pic;
          }

          return {
            pic,
            position: item.position,
            project_id: projectId,
          };
        });

      console.log(editedId, editedItem);

      for (let i = 0; i < editedId.length; i++) {
        const id = editedId[i];
        const item = editedItem[i];
        const { error } = await SupabaseServ.from("cover")
          .update(item)
          .eq("id", id);

        if (error) {
          console.log(`Error updating id ${id}:`, error.message);
        }
      }
      editedId = [];
      editedId = [];
    }
  };
  useEffect(() => {
    handleUpdate();
  }, [showSwapy]);
  //editdatasupabase

  //loaddata
  const [cover, setCover] = useState<Cover[]>([]);
  const [allTag, setAlltag] = useState<typeTag[]>([]);
  const [allProject, setAllProject] = useState<typeProject[]>([]);
  const [originalCover, setOriginalCover] = useState<Set<string>>(new Set());
  const [refresh, setRefresh] = useState(0);
  const [AnimatedDone, setAnimatedDone] = useState(false);
  const forceRender = () => {
    setRefresh((prev) => prev + 1);
  };
  useEffect(() => {
    console.log(refresh);
  }, [refresh]);
  useEffect(() => {
    const load = async () => {
      const [coverRes, projectRes, tagRes] = await Promise.all([
        fetchingCover(),
        fetchingProject(),
        fetchingTag(),
      ]);
      console.log(coverRes);
      const { sorted, maxId } = coverRes;
      console.log(projectRes);
      setAllProject(projectRes);
      setAlltag(tagRes);
      console.log(tagRes);
      id = maxId;
      itemLength = sorted.length;
      setCover(sorted);
      setOriginalCover((prev) => {
        const newSet = new Set(prev);
        sorted.forEach((item) => newSet.add(item.id));
        return newSet;
      });
      setOnload(false);
    };
    load();
  }, []);
  useEffect(() => {
    console.log(originalCover);
  }, [originalCover]);
  //loaddata

  useEffect(() => {
    console.log(showSwapy);
  }, [showSwapy]);
  if (onload) {
    return <div className="w-[100vw] h-[100vh] bg-black"></div>;
  }
  if (user) {
    return (
      <div
        ref={windowRef}
        className="h-[100vh] overflow-x-hidden overflow-y-scroll"
        style={{ scrollbarGutter: "stable" }}
      >
        {
          <SwapperBoard
            isOpen={showSwapy}
            cover={cover}
            itemLength={itemLength}
            id={id}
            allproject={allProject}
            alltag={allTag}
            onUpdate={(updatecover, updateitemlen, updateid, editId, drag) => {
              setCover(
                updatecover
                  .filter(
                    (i) =>
                      i.project.project !== "" &&
                      Array.isArray(i.project.tag) &&
                      i.project.tag[0] !== ""
                  )
                  .map((i) => ({
                    ...i,
                    project: { ...i.project },
                    tag: [...(i.project.tag || [])],
                  }))
              );
              itemLength = updateitemlen;
              id = updateid;
              setIdThatUpdate(editId);
              setShowSwapy(false);
              if (drag) {
              }
              console.log("updated");
              console.log(updatecover);
            }}
            onSwapUpdate={(updatecover, updateitemlen, updateid, editId) => {
              setCover(
                updatecover
                  .filter((i) => {
                    const hasProject = i.project.project !== "";
                    const hasValidTags =
                      Array.isArray(i.project.tag) && i.project.tag[0] !== "";
                    return hasProject && hasValidTags;
                  })
                  .map((i) => ({ ...i }))
              );
              itemLength = updateitemlen;
              id = updateid;
              setIdThatUpdate(editId);
              setShowSwapy(false);
              forceRender();
              setTimeout(() => {
                setShowSwapy(true);
              }, 10);
            }}
          />
        }
        <div className="fixed z-20 h-100 w-100">
          hello{`${user}`}
          <button
            className="cursor-pointer bg-blue-500 text-white px-4 py-2"
            onClick={onLogOut}
          >
            Logut
          </button>
          <button className="h-10 w-10 px-6 cursor-pointer" onClick={() => setShowSwapy(!showSwapy)}>open</button>
        </div>
        {/* Background Scene */}
        <div className="fixed inset-0 -z-10">
          <Scene onthisAnimatedDone={(val) => setAnimated(val)} />
        </div>
        <div className="relative w-screen max-w-[100vw] h-full px-10 flex flex-col xl:flex-row">
          {/* Left Column */}
          <div className="w-full xl:w-[40%]"></div>

          {/* Right Column */}
          <div className="w-full xl:w-[60%] h-[98%] mt-10">
            <AnimatePresence>
              {onAnimated && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Mymasonrygrid
                    key={refresh}
                    Itempic={cover}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <Loginform onSubmit={handleSubmit} />
    </div>
  );
};

export default Page;
