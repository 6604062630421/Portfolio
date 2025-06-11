import { useGLTF } from "@react-three/drei";
import { useEffect,useRef } from "react";
import { SkinnedMesh, Bone } from "three";
import { JSX } from "react";
import { useFrame } from "@react-three/fiber";

type KnightmodelProps = Omit<JSX.IntrinsicElements["primitive"], "object">;

const url =
  "https://pub-05edfa84d00a449d8777fd76bab7a409.r2.dev/compressed_1749626395441_knight2.glb";
useGLTF.preload(url);

export default function Knightmodel(props: KnightmodelProps) {
  const { scene } = useGLTF(url);
  const headBoneRef = useRef<Bone | null>(null);
  useEffect(() => {
  if (headBoneRef.current) return; // ไม่ต้องเซตซ้ำ
  scene.traverse((object) => {
    if (object instanceof SkinnedMesh) {
      const head = object.skeleton.bones.find(b =>
        b.name.toLowerCase().includes("head")
      );
      if (head) {
        headBoneRef.current = head;
        console.log("✅ Found head bone:", head.name);
      }
    }
  });
}, [scene]);

  // ทำให้หัวหันซ้าย-ขวา
  useFrame((state) => {
  const head = headBoneRef.current;
  if (head) {
    const yRot = Math.sin(state.clock.elapsedTime) * 0.3;
    head.rotation.set(0, yRot, 0);
    // หรือ: head.quaternion.setFromEuler(new Euler(0, yRot, 0));
  }
});


  return <primitive object={scene} {...props} />;
}
