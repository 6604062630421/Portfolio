import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Sphere } from '@react-three/drei'

export default function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        {/* แสง */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Objects */}
        <Box position={[-2, 0, 0]} args={[1, 1, 1]}>
          <meshStandardMaterial color="orange" />
        </Box>
        
        <Sphere position={[2, 0, 0]} args={[0.5, 32, 32]}>
          <meshStandardMaterial color="hotpink" />
        </Sphere>
        
        {/* Controls */}
        <OrbitControls />
      </Canvas>
    </div>
  )
}