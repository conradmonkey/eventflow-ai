import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TentCanvas3D({ tentConfig, items, onClose }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(tentConfig.length * 0.8, tentConfig.width * 0.8, tentConfig.length * 0.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const spotLight = new THREE.SpotLight(0xffd700, 0.5);
    spotLight.position.set(0, 100, 0);
    spotLight.angle = Math.PI / 4;
    scene.add(spotLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(tentConfig.length * 2, tentConfig.width * 2);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2d4a2b });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Tent structure
    const tentFrameGeometry = new THREE.BoxGeometry(tentConfig.length, 0.5, tentConfig.width);
    const tentFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const tentFrame = new THREE.Mesh(tentFrameGeometry, tentFrameMaterial);
    tentFrame.position.y = 15;
    scene.add(tentFrame);

    // Tent fabric (drapes)
    const fabricGeometry = new THREE.PlaneGeometry(tentConfig.length, 15);
    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    // Four walls
    const wall1 = new THREE.Mesh(fabricGeometry, fabricMaterial);
    wall1.position.set(0, 7.5, -tentConfig.width / 2);
    scene.add(wall1);

    const wall2 = new THREE.Mesh(fabricGeometry, fabricMaterial);
    wall2.position.set(0, 7.5, tentConfig.width / 2);
    scene.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.PlaneGeometry(tentConfig.width, 15), fabricMaterial);
    wall3.rotation.y = Math.PI / 2;
    wall3.position.set(-tentConfig.length / 2, 7.5, 0);
    scene.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.PlaneGeometry(tentConfig.width, 15), fabricMaterial);
    wall4.rotation.y = Math.PI / 2;
    wall4.position.set(tentConfig.length / 2, 7.5, 0);
    scene.add(wall4);

    // Add items
    items.forEach(item => {
      let mesh;
      const scale = 1;

      if (item.type === 'stage') {
        const geometry = new THREE.BoxGeometry(item.width * scale, item.height * scale, item.length * scale);
        const material = new THREE.MeshStandardMaterial({ color: item.color });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          item.height * scale / 2,
          (item.y - tentConfig.width / 2) * scale
        );
      } else if (item.type === 'danceFloor') {
        const geometry = new THREE.BoxGeometry(item.width * scale, 0.2, item.length * scale);
        const material = new THREE.MeshStandardMaterial({ color: item.color, metalness: 0.8 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          0.1,
          (item.y - tentConfig.width / 2) * scale
        );
      } else if (item.type === 'table8ft' || item.type === 'table6ft') {
        const w = item.type === 'table8ft' ? 8 : 6;
        const geometry = new THREE.BoxGeometry(w * scale, 2.5, 2.5 * scale);
        const material = new THREE.MeshStandardMaterial({ color: item.color });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          1.25,
          (item.y - tentConfig.width / 2) * scale
        );
      } else if (item.type === 'table5ft') {
        const geometry = new THREE.CylinderGeometry(2.5 * scale, 2.5 * scale, 2.5, 32);
        const material = new THREE.MeshStandardMaterial({ color: item.color });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          1.25,
          (item.y - tentConfig.width / 2) * scale
        );
      } else if (item.type === 'chair') {
        const geometry = new THREE.BoxGeometry(2 * scale, 3, 2 * scale);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          1.5,
          (item.y - tentConfig.width / 2) * scale
        );
      }

      if (mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      camera.position.x = Math.cos(Date.now() * 0.0001) * tentConfig.length;
      camera.position.z = Math.sin(Date.now() * 0.0001) * tentConfig.length;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [tentConfig, items]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">3D Tent Visualization</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div ref={mountRef} className="flex-1" />
      </div>
    </div>
  );
}