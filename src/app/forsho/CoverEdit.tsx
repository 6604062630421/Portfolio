import { FC, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ImageUploader from "./crop";
interface CoverEditProps {
  onClose: () => void;
  isOpen: boolean;
}
const CoverEdit: FC<CoverEditProps> = ({ onClose, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed w-[100vw] h-[100vh] bg-black/50 justify-center flex items-center z-50 inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-[90%] h-[70%] rounded-xl bg-white p-6 shadow-lg md:w-[80%]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between border-b-1 pb-5 border-[#0000003d] h-[10%]">
                <div className="">
                    <h1 className="text-[24px] font-semibold">Project</h1>
                </div>
                <X onClick={onClose} className="cursor-pointer"/>
            </div>
            <div className="h-[90%] overflow-auto"><ImageUploader/></div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoverEdit;
