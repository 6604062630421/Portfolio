import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { SkinnedMesh, Bone, Euler, MathUtils } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { JSX } from "react";

type KnightmodelProps = Omit<JSX.IntrinsicElements["primitive"], "object">;

const url =
  "https://pub-05edfa84d00a449d8777fd76bab7a409.r2.dev/compressed_1750773765254_the_forgotten_knight.glb";
useGLTF.preload(url);

export default function Knightmodel(props: KnightmodelProps) {
  const { scene, gl } = useThree();
  const { scene: loadedScene } = useGLTF(url);
  const bonesRef = useRef<Record<string, Bone>>({});
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // ดักจับเม้าส์บน window แล้ว normalize ตามตำแหน่ง canvas จริง
  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!gl.domElement) return;
      const rect = gl.domElement.getBoundingClientRect();

      // คำนวณตำแหน่งเม้าส์ normalized -1 ถึง 1
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMouse({ x, y });
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [gl]);

  // โหลดและเก็บ bones
  useEffect(() => {
    loadedScene.traverse((object) => {
      if (object instanceof SkinnedMesh) {
        object.skeleton.bones.forEach((bone) => {
          bonesRef.current[bone.name] = bone;
        });
      }
    });
  }, [loadedScene]);

  // ขยับหัวตามเม้าส์ทุกเฟรม
  useFrame(() => {
    const head = bonesRef.current["headx_5"]; // แก้ชื่อ bone ให้ตรงกับโมเดล
    if (!head) return;
    if (sessionStorage.getItem("loaded")!=='true') return;
    const targetY = MathUtils.clamp(mouse.x * 0.5, -0.5, 0.5);
    const targetX = MathUtils.clamp(-mouse.y * 0.3, -0.3, 0.3);
    const targetEuler = new Euler(targetX, targetY, 0);

    const targetQuat = head.quaternion.clone().setFromEuler(targetEuler);

    head.quaternion.slerp(targetQuat, 0.1);
    head.updateMatrixWorld(true);
  });

  return <primitive object={loadedScene} {...props} />;
}
