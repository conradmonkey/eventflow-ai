import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TentCanvas3D({ tentConfig, items, onClose }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    scene.fog = new THREE.Fog(0x0a0a15, 200, 500);

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(tentConfig.length * 1.2, tentConfig.width * 0.9, tentConfig.length * 1.2);
    camera.lookAt(0, 5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // Elegant Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.4);
    scene.add(ambientLight);

    // Key light - warm elegant glow
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(80, 120, 60);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 300;
    keyLight.shadow.camera.left = -100;
    keyLight.shadow.camera.right = 100;
    keyLight.shadow.camera.top = 100;
    keyLight.shadow.camera.bottom = -100;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xaaccff, 0.6);
    rimLight.position.set(-60, 40, -60);
    scene.add(rimLight);

    // Elegant spotlights for dramatic effect
    const spotLight1 = new THREE.SpotLight(0xffd700, 1.5, 150, Math.PI / 6, 0.5);
    spotLight1.position.set(0, 80, 0);
    spotLight1.castShadow = true;
    scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0xff9966, 0.8, 100, Math.PI / 5, 0.6);
    spotLight2.position.set(-40, 60, 40);
    scene.add(spotLight2);

    const spotLight3 = new THREE.SpotLight(0x66ccff, 0.6, 100, Math.PI / 5, 0.6);
    spotLight3.position.set(40, 60, -40);
    scene.add(spotLight3);

    // Elegant Floor
    const floorGeometry = new THREE.PlaneGeometry(tentConfig.length * 1.2, tentConfig.width * 1.2);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.4
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grass around tent
    const grassGeometry = new THREE.PlaneGeometry(tentConfig.length * 3, tentConfig.width * 3);
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a3d1a,
      roughness: 0.9
    });
    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.1;
    grass.receiveShadow = true;
    scene.add(grass);

    // Elegant tent structure with peaked roof
    const tentPeakHeight = 20;
    
    // Tent poles (elegant metal)
    const poleMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, tentPeakHeight);
    const corners = [
      [-tentConfig.length / 2, 0, -tentConfig.width / 2],
      [tentConfig.length / 2, 0, -tentConfig.width / 2],
      [-tentConfig.length / 2, 0, tentConfig.width / 2],
      [tentConfig.length / 2, 0, tentConfig.width / 2]
    ];
    
    corners.forEach(([x, y, z]) => {
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.set(x, tentPeakHeight / 2, z);
      pole.castShadow = true;
      scene.add(pole);
    });

    // Elegant draped fabric with better material
    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8f0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      metalness: 0.1,
      roughness: 0.7,
      emissive: 0xfff5e6,
      emissiveIntensity: 0.1
    });

    // Roof panels (draped effect)
    const roofGeometry1 = new THREE.PlaneGeometry(tentConfig.length, tentConfig.width / 2);
    const roof1 = new THREE.Mesh(roofGeometry1, fabricMaterial);
    roof1.position.set(0, tentPeakHeight - 3, -tentConfig.width / 4);
    roof1.rotation.x = -Math.PI / 8;
    scene.add(roof1);

    const roof2 = new THREE.Mesh(roofGeometry1, fabricMaterial);
    roof2.position.set(0, tentPeakHeight - 3, tentConfig.width / 4);
    roof2.rotation.x = Math.PI / 8;
    scene.add(roof2);

    // Side drapes with elegant curves
    const wallHeight = tentPeakHeight - 4;
    const wallGeometry = new THREE.PlaneGeometry(tentConfig.length, wallHeight);
    
    const wall1 = new THREE.Mesh(wallGeometry, fabricMaterial);
    wall1.position.set(0, wallHeight / 2, -tentConfig.width / 2);
    scene.add(wall1);

    const wall2 = new THREE.Mesh(wallGeometry, fabricMaterial);
    wall2.position.set(0, wallHeight / 2, tentConfig.width / 2);
    wall2.rotation.y = Math.PI;
    scene.add(wall2);

    const sideWallGeometry = new THREE.PlaneGeometry(tentConfig.width, wallHeight);
    const wall3 = new THREE.Mesh(sideWallGeometry, fabricMaterial);
    wall3.rotation.y = Math.PI / 2;
    wall3.position.set(-tentConfig.length / 2, wallHeight / 2, 0);
    scene.add(wall3);

    const wall4 = new THREE.Mesh(sideWallGeometry, fabricMaterial);
    wall4.rotation.y = -Math.PI / 2;
    wall4.position.set(tentConfig.length / 2, wallHeight / 2, 0);
    scene.add(wall4);

    // String lights for elegance
    for (let i = 0; i < 8; i++) {
      const light = new THREE.PointLight(0xffeecc, 0.5, 30);
      const angle = (i / 8) * Math.PI * 2;
      const radius = Math.min(tentConfig.length, tentConfig.width) * 0.4;
      light.position.set(
        Math.cos(angle) * radius,
        tentPeakHeight - 5,
        Math.sin(angle) * radius
      );
      scene.add(light);
    }

    // Add items
    items.forEach(item => {
      let mesh;
      const scale = 1;

      if (item.type === 'stage') {
        const geometry = new THREE.BoxGeometry(item.width * scale, item.height * scale, item.length * scale);
        const material = new THREE.MeshStandardMaterial({ 
          color: item.color,
          metalness: 0.3,
          roughness: 0.5
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          item.height * scale / 2,
          (item.y - tentConfig.width / 2) * scale
        );
        
        // Add stage lighting
        const stageLight = new THREE.SpotLight(0xff88cc, 1, 50, Math.PI / 6, 0.5);
        stageLight.position.set(mesh.position.x, 25, mesh.position.z);
        stageLight.target.position.copy(mesh.position);
        scene.add(stageLight);
        scene.add(stageLight.target);
        
      } else if (item.type === 'danceFloor') {
        const geometry = new THREE.BoxGeometry(item.width * scale, 0.3, item.length * scale);
        const material = new THREE.MeshStandardMaterial({ 
          color: item.color,
          metalness: 0.9,
          roughness: 0.2,
          emissive: item.color,
          emissiveIntensity: 0.2
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          0.15,
          (item.y - tentConfig.width / 2) * scale
        );
        
      } else if (item.type === 'table8ft' || item.type === 'table6ft') {
        const w = item.type === 'table8ft' ? 8 : 6;
        const geometry = new THREE.BoxGeometry(w * scale, 0.15, 2.5 * scale);
        const material = new THREE.MeshStandardMaterial({ 
          color: item.color,
          metalness: 0.2,
          roughness: 0.6
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          2.5,
          (item.y - tentConfig.width / 2) * scale
        );
        
        // Add table legs
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
        [[-w/2 + 0.5, 0, -1], [w/2 - 0.5, 0, -1], [-w/2 + 0.5, 0, 1], [w/2 - 0.5, 0, 1]].forEach(([x, y, z]) => {
          const leg = new THREE.Mesh(legGeometry, legMaterial);
          leg.position.set(
            (item.x - tentConfig.length / 2) * scale + x,
            1.25,
            (item.y - tentConfig.width / 2) * scale + z
          );
          leg.castShadow = true;
          scene.add(leg);
        });
        
      } else if (item.type === 'table5ft') {
        const geometry = new THREE.CylinderGeometry(2.5 * scale, 2.5 * scale, 0.15, 32);
        const material = new THREE.MeshStandardMaterial({ 
          color: item.color,
          metalness: 0.2,
          roughness: 0.6
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (item.x - tentConfig.length / 2) * scale,
          2.5,
          (item.y - tentConfig.width / 2) * scale
        );
        
        // Center leg
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.5);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(
          (item.x - tentConfig.length / 2) * scale,
          1.25,
          (item.y - tentConfig.width / 2) * scale
        );
        leg.castShadow = true;
        scene.add(leg);
        
      } else if (item.type === 'chair') {
        const seatGeometry = new THREE.BoxGeometry(1.8 * scale, 0.2, 1.8 * scale);
        const backGeometry = new THREE.BoxGeometry(1.8 * scale, 2, 0.2);
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x5d3a1a,
          metalness: 0.1,
          roughness: 0.8
        });
        
        const seat = new THREE.Mesh(seatGeometry, material);
        seat.position.set(
          (item.x - tentConfig.length / 2) * scale,
          1.5,
          (item.y - tentConfig.width / 2) * scale
        );
        
        const back = new THREE.Mesh(backGeometry, material);
        back.position.set(
          (item.x - tentConfig.length / 2) * scale,
          2.5,
          (item.y - tentConfig.width / 2) * scale - 0.8
        );
        
        seat.castShadow = true;
        back.castShadow = true;
        scene.add(seat);
        scene.add(back);
      }

      if (mesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });

    // Animation with smooth elegant camera movement
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.0002;
      camera.position.x = Math.cos(time) * tentConfig.length * 1.2;
      camera.position.z = Math.sin(time) * tentConfig.length * 1.2;
      camera.position.y = tentConfig.width * 0.9 + Math.sin(time * 0.5) * 5;
      camera.lookAt(0, 5, 0);
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