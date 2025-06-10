// components/ImageUploader.tsx
import React, { useState, useRef } from "react";
import { CropperRef, Cropper } from "react-advanced-cropper";
import SupabaseService from "../service/supabase"
import "react-advanced-cropper/dist/style.css";
import './style.css'
type Exportblob ={
  exportblob:(bloblink:string,publicUrl:string)=>void;
  filename:string,
  oldpic:string|undefined,
}
const ImageUploader: React.FC<Exportblob> = ({exportblob,filename,oldpic}) => {
  const supabase = SupabaseService.getClient();
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropperRef = useRef<CropperRef | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const cropImage = async () => {
    if (!image) return;
    
    const cropped = cropperRef.current?.getCanvas();
    if (cropped) {
      cropped.toBlob(async(blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log(url);
          setCroppedImage(url);
          const extension = blob.type.split('/')[1]||'bin';
          const FileName = `${filename}-${Date.now()}.${extension}`
          const {error} = await supabase.storage.from('cover').upload(FileName,blob,{
            cacheControl:'3600',
            upsert:true,
            contentType:blob.type,
          })
          if(error){
            console.log(error.message);
          }
          const {data:publicUrl} = await supabase.storage.from('cover').getPublicUrl(FileName);
          console.log(publicUrl);
          exportblob(url,publicUrl.publicUrl);
          
        }
        else{
          console.log('blob null')
        }
      }, "image/png");
      console.log(oldpic);
      if(oldpic!==undefined || oldpic !=='./haerin.jpg'){
        if (
            oldpic!.startsWith(
              "https://wkvbmoddmccxnxcieprm.supabase.co/storage/v1/object/public/cover/"
            )
          ) {
            oldpic = oldpic!.split("/").pop() || oldpic;
          }
      const {error} = await supabase.storage.from('cover').remove([oldpic!]);
      if(error){
        console.log(error.message);
      }
      console.log("deleted oldpic")
    }
    }
  };
  const onCropChange = (cropper: CropperRef) => {
    cropperRef.current = cropper;
    //console.log(cropper.getCoordinates(), cropper.getCanvas());
  };
  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={onFileChange} />

      {image && (
        <div className="relative h-fit  rounded overflow-hidden">
          <Cropper
            src={image}
            onChange={onCropChange}
            className="h-[600px] "
            style={{ background: "transparent", objectFit: "contain"}}

            stencilProps={{
              grid:true,
              gay:true,
              
            }}
            
          />
        </div>
      )}

      {image && <button onClick={cropImage}>ตัดภาพ</button>}

      {croppedImage && (
        <div>
          <h3>Preview:</h3>
          <img
            src={croppedImage}
            alt="Cropped"
            className="h-[500px] object-cover rounded aspect-auto"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
