// components/AutocompleteInput.tsx
"use client";

import { useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { typeProject } from "../type";
import SupabaseService from "../service/supabase";

type Project ={
    projectName:string;
    onSubmit :(value:string)=>void;
    allproject:typeProject[];
}

export default function AutocompleteInput({onSubmit,projectName,allproject}:Project) {
  const supabase = SupabaseService.getClient();
  const [input, setInput] = useState(projectName);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allProjectName] = useState(allproject.map((i)=>i.name));
  useEffect(() => {
    const matches = allProjectName.filter((s) =>
      s.toLowerCase().includes(input.toLowerCase())
    );
    setFiltered(matches);
  }, [input]);
  useEffect(()=>{
    console.log(filtered,allproject);
  },[filtered])
  const handleSelect = (value: string) => {
    setInput(value);
    onSubmit(value);
    setShowDropdown(false);
    
  };
  const handleNew = async(value:string)=>{
    const {error} = await supabase.from('project').insert({project:value});
    if(error){
      console.log(error);
    }
    handleSelect(value);
  }
  return (
    <div className="relative w-full max-w-md">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => {
          setFiltered(allProjectName); // โชว์ทั้งหมดทันที
          setShowDropdown(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 100); // delay ปิด dropdown
        }}
        placeholder={projectName}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filtered.map((item, idx) => (
              <li
                key={idx}
                onMouseDown={() => handleSelect(item)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {item}
              </li>
            ))}

            {
              (
                <li
                  onMouseDown={() => handleNew(input)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium cursor-pointer"
                >
                สร้าง “{input}”
                </li>
              )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}