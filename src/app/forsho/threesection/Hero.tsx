"use client";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { Spherical, Vector3, Quaternion } from "three";
import gsap from "gsap";
import Knightmodel from "./loadmodel";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
  onTextshow: (val: boolean) => void;
  onAnimatedDone: (val: boolean) => void;
};

function CameraOrbitAroundCenter({ onTextshow, onAnimatedDone }: Props) {
  const { camera } = useThree();
  const spherical = useRef(new Spherical());
  const center = new Vector3(0, 0.9, 0); // จุดกลางของโมเดล
  const progressRef = useRef({ theta: 0, radius: 2.5 });
  const done = useRef(false);
  useEffect(() => {
    const loaded = sessionStorage.getItem("loaded") === "true";
    let textshow = false;
    const initial = camera.position.clone().sub(center);
    spherical.current.setFromVector3(initial);
    progressRef.current.theta = spherical.current.theta;
    progressRef.current.radius = spherical.current.radius;
    const finalPosition = new Vector3(
      -0.5940547827149792,
      0.9224485541109069,
      1.126827515051355
    );
    const finalLookAt = new Vector3(
      0.6000341583329957,
      1.0041597062028096,
      0.12547706360221786
    );
    const finalQuat = new Quaternion();
    const dummyCam = camera.clone();
    dummyCam.position.copy(finalPosition);
    dummyCam.lookAt(finalLookAt);
    finalQuat.copy(dummyCam.quaternion);

    if (loaded) {
      done.current = true;
      onTextshow(false);
      camera.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
      camera.quaternion.set(finalQuat.x, finalQuat.y, finalQuat.z, finalQuat.w);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      onAnimatedDone(true);
      return;
    }
    gsap.to(progressRef.current, {
      theta: spherical.current.theta + Math.PI,
      radius: 2,
      duration: 3,
      ease: "expo.out",
      onComplete: () => {
        gsap.to(progressRef.current, {
          radius: 2.1,
          duration: 2,
          ease: "sine.inOut",
          onComplete: () => {
            gsap.to(progressRef.current, {
              radius: 4,
              duration: 0.3,
              ease: "circ.inOut",
              onComplete: () => {
                done.current = true;
                if (!textshow) {
                  onTextshow(true);
                  textshow = true;
                }

                gsap.delayedCall(4, () => {
                  onTextshow(false);

                  gsap.to(camera.position, {
                    x: finalPosition.x,
                    y: finalPosition.y,
                    z: finalPosition.z,
                    duration: 2,
                    ease: "power2.inOut",
                  });

                  gsap.to(camera.quaternion, {
                    x: finalQuat.x,
                    y: finalQuat.y,
                    z: finalQuat.z,
                    w: finalQuat.w,
                    duration: 2,
                    ease: "power2.inOut",
                  });

                  gsap.delayedCall(2, () => {
                    sessionStorage.setItem("loaded", "true");
                    onAnimatedDone(true);
                  });
                });
              },
            });
          },
        });
      },
    });
  }, [camera]);

  useFrame(() => {
    if (done.current) return;

    const s = spherical.current;
    s.theta = progressRef.current.theta;
    s.radius = progressRef.current.radius;

    const newPos = new Vector3().setFromSpherical(s).add(center);
    camera.position.copy(newPos);
    camera.lookAt(center);
  });

  return null;
}

function CameraDebugger() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onChange = () => {
      console.log("📍 Camera Position:", camera.position.toArray());
      console.log("🎯 Camera Looking At:", controls.target.toArray());
    };

    controls.addEventListener("change", onChange);
    return () => controls.removeEventListener("change", onChange);
  }, [camera]);

  return <OrbitControls ref={controlsRef} />;
}
type MainProp = {
  onthisAnimatedDone: (val: boolean) => void;
};
export default function Scene({ onthisAnimatedDone }: MainProp) {
  const [isTextshow, setTextshow] = useState(false);
  return (
    <div className="relative w-screen h-screen">
      {isTextshow && (
        <div
          className="z-0 absolute top-0 left-0 w-screen h-screen flex justify-center items-center text-[300px] font-bold text-red-500
        "
        >
          Hello
        </div>
      )}
      <div className="z-10 absolute top-0 left-0 w-screen h-screen">
        <Canvas camera={{ fov: 40, position: [-0.00887, 0.83029, -0.70579] }}>
          <ambientLight intensity={4} />
          <Environment preset="city" />
          <Knightmodel position={[0, 0, 0]} scale={0.5} />
          <CameraOrbitAroundCenter
            onTextshow={(val) => setTextshow(val)}
            onAnimatedDone={(val) => onthisAnimatedDone(val)}
          />
        </Canvas>
      </div>
    </div>
  );
}
