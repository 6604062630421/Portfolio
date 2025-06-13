'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls,Environment} from '@react-three/drei'
import Knightmodel from './loadmodel'

export default function Scene() {
  // https://cdn.jsdelivr.net/gh/6604062630421/3d-assets/the_forgotten_knight.glb
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ fov: 40, position: [0, 2, 5] }}>
        {/* แสง */}
        <ambientLight intensity={4} />
        <Environment preset="city" />
        {/* Objects */}
        <Knightmodel position={[0, 0, 0]} scale={0.5} />
        <OrbitControls/>
      </Canvas>
    </div>
  )
}