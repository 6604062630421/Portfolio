
import React, { useEffect, useState } from 'react'

interface LoginFormprops{
    onSubmit:(email:string,pass:string) => void;
    email?:string;
}
const Loginform:React.FC<LoginFormprops> = ({onSubmit,email=""}) => {
    const [thisemail,setEmail] = useState<string>(email);
    const [thispass,setPass] = useState<string>("");
    const handleSubmit = (e:React.FormEvent)=>{
        e.preventDefault();
        onSubmit(thisemail,thispass);
    }
    useEffect(()=>{
        if(typeof window !== "undefined"){
            setEmail(localStorage.getItem("email")||"");
        }
    },[])
  return (
    <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={thisemail}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={thispass}
            onChange={(e) => setPass(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">
            Login
          </button>
        </form>
    </div>
  )
}

export default Loginform