import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



const ARPreview = () => {
  const canvasRef = useRef();
  const location = useLocation();

  // Get name and image from URL query
  const params = new URLSearchParams(location.search);
  const name = params.get("name") || "Outfit";
  const image = params.get("image");

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    document.body.appendChild(renderer.domElement);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    // Simple Bot Geometry
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 3;

    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "40px", padding: "20px" }}>
      <div>
        <h2 style={{ textAlign: "center", color: "white" }}>Try on: {name}</h2>
        <canvas ref={canvasRef} style={{ width: "400px", height: "400px", background: "transparent" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={image}
          alt={name}
          style={{ maxWidth: "300px", borderRadius: "12px", boxShadow: "0 0 15px rgba(255,255,255,0.2)" }}
        />
        <a
          href="/shop"
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#ff9900",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Back to Shop
        </a>
      </div>
    </div>
  );
};

export default ARPreview;
