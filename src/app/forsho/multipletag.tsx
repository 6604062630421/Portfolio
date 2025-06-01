// components/AutocompleteInput.tsx
"use client";

import { useState, useEffect, FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { typeTag } from "../type";
import SupabaseService from '../service/supabase';

const suggestions = ["Website Design", "Mobile App", "Branding", "Logo Design"];

type Project = {
  selectedtag:string[]
  onSubmit: (values: string[]) => void;
  alltag:typeTag[];
};

export default function AutocompleteInput({ onSubmit ,selectedtag,alltag}: Project) {
  const supabase = SupabaseService.getClient();
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>([...selectedtag]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allTagName,setAllTagName] = useState(alltag.map((i)=>i.name));
  useEffect(()=>{
    setFiltered(allTagName)
  },[alltag])
  useEffect(() => {
    console.log(selectedtag);
    const matches = allTagName.filter(
      (s) =>
        s.toLowerCase().includes(input.toLowerCase()) &&
        !tags.includes(s)
    );
    setFiltered(matches);
  }, [input, tags]);

  const addTag = (value: string) => {
    if (!tags.includes(value)) {
      const newTags = [...tags.filter(tag => tag !== ""), value];
      setTags(newTags);
      onSubmit(newTags);
    }
    setInput("");
    setShowDropdown(false);
  };

  const removeTag = (value: string) => {
    const updated = tags.filter((tag) => tag !== value);
    setTags(updated);
    onSubmit(updated);
  };
  const handleNew = async(value:string)=>{
    console.log(value);
    const {error} = await supabase.from('tag').insert({tag_name:value});
    if(error){
      console.log(error.message);
    }
    console.log('inserted tag')
    addTag(value);
  }
  return (
    <div className="relative w-full max-w-md space-y-2">
      {/* Tag chips */}
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 && tags[0]!==""?tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </span>
        )):(
          <div></div>
        )}
      </div>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => {
          setFiltered(allTagName);
          setShowDropdown(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowDropdown(false), 100);
        }}
        placeholder={"Tag"}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filtered.map((item, idx) => (
              <li
                key={idx}
                onMouseDown={() => addTag(item)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {item}
              </li>
            ))}

            {(
              <li
                onMouseDown={() => handleNew(input)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium cursor-pointer"
              >
                ➕ สร้าง “{input}”
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
