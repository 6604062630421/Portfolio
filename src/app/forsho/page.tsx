"use client";
import React, { useEffect, useState } from "react";
import AuthService from "../service/Authservice";
import Loginform from "./loginform";
import { motion ,AnimatePresence } from "framer-motion";
import { useRef } from "react";
import Test from "./somefunc";

type Item = {id:string; label:string}
const Page = () => {
  const supabase = AuthService.getInstance();
  const [user, setUser] = useState<unknown>();
  const [rows, setRows] = useState<Item[][]>([
    [ { id: "a", label: "A" } ],
    [ { id: "b", label: "B" } ],
    [ { id: "c", label: "C" } ],
  ]);
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

  

  const handleDrop = (targetRow: number, targetIndex: number) => {
    const draggedId = sessionStorage.getItem("draggedId");
    if (!draggedId) return;

    const draggedItem = rows.flat().find(i => i.id === draggedId);
    if (!draggedItem) return;

    const newRows = rows.map(row => row.filter(item => item.id !== draggedId));
    newRows[targetRow].splice(targetIndex, 0, draggedItem); // แทรก

    setRows(newRows);
    sessionStorage.removeItem("draggedId");
  };

  if (true) {
    return (
      <div ref={windowRef} className="h-[100vh]">
        hello{`${user}`}
        <button className="bg-blue-500 text-white px-4 py-2" onClick={onLogOut}>
          Logut
        </button>
        
        <div className="flex gap-1 p-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="min-h-[120px] min-w-[120px] bg-gray-100 rounded border border-gray-300 flex flex-col-reverse">
          <div
            className="w-full h-full bg-red-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(rowIndex, row.length)}
          />
          <AnimatePresence>
            {row.map((item, itemIndex) => (
              <div key={item.id}>
                <div
            className="w-full h-6 bg-amber-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(rowIndex, row.length)}
          />
              <motion.div
                key={item.id}
                layout
                className="bg-blue-500 aspect-1/1 text-white rounded cursor-grab flex flex-col justify-between"
                draggable
                onDragStart={() => {
                  sessionStorage.setItem("draggedId", item.id);
                }}
                // onDragEnter={(e) => {
                //   e.preventDefault();
                //   const draggedId = sessionStorage.getItem("draggedId");
                //   if (draggedId && draggedId !== item.id) {
                //     handleDrop(rowIndex, itemIndex);
                //   }
                // }}
                whileDrag={{ scale: 1.1 }}
              >
                
                {item.label}
                
              </motion.div>
              <div
            className="w-full h-6 bg-amber-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(rowIndex, row.length)}
          />
              </div>
              
              
            ))}
            
          </AnimatePresence>
          {/* ปล่อยที่ท้าย row ได้ */}
          
        </div>
      ))}
    </div>
      <Test/>
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
