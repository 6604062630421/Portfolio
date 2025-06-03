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
let itemLength: number;
let id: number;

const Page = () => {
  const [showProject, setShowProject] = useState<boolean>(false);
  const [showSwapy, setShowSwapy] = useState<boolean>(false);
  const [onload, setOnload] = useState<boolean>(true);
  //loaddatasupabase
  const supabase = AuthService.getInstance();
  const SupabaseServ = SupabaseService.getClient();
  const [user, setUser] = useState<unknown>();
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
      const idItem = sorted.map((item) => item.id);
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
      <div ref={windowRef} className="h-[100vh] overflow-x-hidden"
      style={{ scrollbarGutter: "stable" }}>
        {
          <SwapperBoard
            isOpen={showSwapy}
            cover={cover}
            itemLength={itemLength}
            id={id}
            allproject={allProject}
            alltag={allTag}
            onUpdate={(updatecover, updateitemlen, updateid, editId) => {
              setCover(
                updatecover.filter((i) => {
                  const hasProject = i.project.project !== "";
                  const hasValidTags =
                    Array.isArray(i.project.tag) && i.project.tag[0] !== "";
                  return hasProject && hasValidTags;
                })
              );
              itemLength = updateitemlen;
              id = updateid;
              setIdThatUpdate(editId);
              setShowSwapy(false);
              console.log("updated");
              console.log(updatecover);
            }}
            onSwapUpdate={(updatecover, updateitemlen, updateid, editId) => {
              setCover(
                updatecover.filter((i) => {
                  const hasProject = i.project.project !== "";
                  const hasValidTags =
                    Array.isArray(i.project.tag) && i.project.tag[0] !== "";
                  return hasProject && hasValidTags;
                })
              );
              itemLength = updateitemlen;
              id = updateid;
              setIdThatUpdate(editId);
              setShowSwapy(false);
              setTimeout(() => {
                setShowSwapy(true);
              }, 10);
            }}
          />
        }
        hello{`${user}`}
        <button className="bg-blue-500 text-white px-4 py-2" onClick={onLogOut}>
          Logut
        </button>
        <div className="max-w-[100vw] w-[100vw] px-10 bg-amber-200 relative flex xl:flex-row flex-col grid-cols-2">
          <div className="bg-amber-400 xl:w-[40%]">
            <button onClick={() => setShowSwapy(!showSwapy)}>open</button>
          </div>
          <div className="xl:w-[60%]">
            <Mymasonrygrid Itempic={cover}/>
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
