"use client";
import React, { useEffect, useState } from "react";
import AuthService from "../service/Authservice";
import Loginform from "./loginform";
import { useRef } from "react";
import SwapperBoard from "./swapboard";
import ImageUploader from "./crop";
import CoverEdit from "./CoverEdit";
const Page = () => {
  const [show, setShow] = useState<boolean>(false);

//supabase
  const supabase = AuthService.getInstance();
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
  //supabase

  if (true) {
    return (
      <div ref={windowRef} className="h-[100vh] overflow-x-hidden">
        {show && <CoverEdit onClose={()=>setShow(false)} isOpen={show}/>}
        hello{`${user}`}
        <button className="bg-blue-500 text-white px-4 py-2" onClick={onLogOut}>
          Logut
        </button>
        <div className="max-w-[100vw] w-[100vw] px-10 bg-amber-200 relative">
          <SwapperBoard />
          
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
