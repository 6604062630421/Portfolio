// components/ImageUploader.tsx
import React, { useState, useCallback, useRef } from "react";
import {CropperRef,Cropper} from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css'
import { getCroppedImg } from "./utils/cropImage";
const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropperRef =useRef<CropperRef|null>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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
    if(cropped){
      const base64 = cropped.toDataURL("image/png");
      setCroppedImage(base64);
    }
  };
  const onCropChange = (cropper:CropperRef) =>{
    cropperRef.current = cropper;
    console.log(cropper.getCoordinates(),cropper.getCanvas())
  }
  return (
    <div className="space-y-4">
      <input type="file" accept="image/*" onChange={onFileChange} />

      {image && (
        <div className="relative h-fit bg-gray-200 rounded overflow-hidden">
          <Cropper src={image} onChange={onCropChange} className="h-[600px]" style={{background:'transparent',objectFit:'contain'}}/>
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
