import { FC, useEffect, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ImageUploader from "./crop";
import AutocompleteInput from "./Autocorrect";
import MultiTagInput from "./multipletag";
import type { Cover ,CoverEdit as CoverItem, typeProject, typeTag} from "../type";
interface CoverEditProps {
  onClose: () => void;
  isOpen: boolean;
  selectedCover:Cover|undefined;
  onExit:(edited:CoverItem) => void;
  isUpdate:(updateStatus:string) => void;
  alltag:typeTag[];
  allproject:typeProject[];
}
const CoverEdit: FC<CoverEditProps> = ({ onClose, isOpen ,selectedCover ,onExit,isUpdate,alltag,allproject}) => {
  const [allTag] = useState<typeTag[]>(alltag);
  const [allProject] = useState<typeProject[]>(allproject);
  const [form,setForm] = useState<CoverItem>({
    Project:selectedCover?.project.project??"",
    Tag:selectedCover?.project.tag.join(",")??"",
    image:selectedCover?.pic??"",
  })
  const [isEdit,setEdit] = useState<boolean>(false);
  const anyEdit = () =>{
    console.log(isEdit);
    setEdit(true);
  }
  useEffect(()=>{
    if(isEdit){
      console.log(selectedCover!.id);
      isUpdate(selectedCover!.id);
    }
  },[isEdit])
  const onProjectSubmit = (value:string)=>{
    setForm({...form,'Project':value});
    anyEdit();
  }
  const onTagSubmit = (value:string[])=>{
    setForm({...form,'Tag':value.join(",")});
    anyEdit();
  }
  const onPicSubmit = (value:string,publicUrl:string)=>{
    console.log('fromonpic',value,publicUrl);
    setForm({...form,'image':publicUrl})
    anyEdit();
  }
  useEffect(()=>{
    console.log(selectedCover);
  },[])
  const handleClose = ()=>{
    onExit(form);
    onClose();
  }
  useEffect(() => {
  if (selectedCover) {
    setForm({
      Project: selectedCover.project.project,
      Tag: selectedCover.project.tag.join(","),
      image: selectedCover.pic,
    });
  }
}, [selectedCover]);
  //supabase
  useEffect(()=>{
    console.log(form)
  },[form])
  //supabase
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed w-[100vw] h-[100vh] bg-black/50 justify-center flex items-center z-50 inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-[90%] h-[90%] rounded-xl bg-white px-6 shadow-lg md:w-[80%]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between border-b-1  border-[#0000003d] py-4">
              <div className="">
                <h1 className="text-[24px] font-semibold">Project</h1>
              </div>
              <X onClick={handleClose} className="cursor-pointer" />
            </div>
            <div className="h-[90%] overflow-auto pt-5">
              <form className="flex flex-col mx-2">
                <label>Project: </label>
                <AutocompleteInput onSubmit={onProjectSubmit} projectName={form.Project!} allproject={allProject}/>
                <label>Tag :</label>
                <MultiTagInput onSubmit={onTagSubmit} selectedtag={form.Tag?.split(',')||[]} alltag={allTag}/>
              </form>
              <ImageUploader exportblob={onPicSubmit} filename={`${form.Project!}${selectedCover?.id}`} oldpic={form.image}/>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoverEdit;
