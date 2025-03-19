import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const Model = () => {
  const { scene } = useGLTF("/models/main_model.glb"); // Ensure the file is inside the public folder

  return <primitive object={scene} scale={1.5} />;
};

const ARViewer = () => {
  return (
    <Canvas style={{marginTop:"0%",Minheight:"100vh",width:"100vw"}}>
      <ambientLight intensity={13} />
      <directionalLight position={[20, 10, 5]} intensity={1.5} />
      <Model />
      <OrbitControls />
    </Canvas>
  );
};

export default ARViewer;
