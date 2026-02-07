import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function View3DRenderer({ items, scale, onClose }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(50, 40, 80);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(100, 100, 100);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create items in 3D
    items.forEach((item) => {
      if (item.type.startsWith('tent')) {
        createTent(scene, item, scale);
      } else if (item.type === 'stage') {
        createStage(scene, item, scale);
      } else if (item.type === 'video_wall') {
        createVideoWall(scene, item, scale);
      } else if (item.type === 'toilet') {
        createToilet(scene, item, scale);
      } else if (item.type === 'handwash') {
        createHandwash(scene, item, scale);
      } else if (item.type === 'sink') {
        createSink(scene, item, scale);
      }
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Slow rotation for better view
      if (sceneRef.current) {
        sceneRef.current.children.forEach(child => {
          if (child.userData.animate) {
            child.rotation.y += 0.002;
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [items, scale]);

  const createTent = (scene, item, scale) => {
    const tentGeometry = new THREE.BoxGeometry(item.type === 'tent_10x10' ? 10 : item.type === 'tent_10x20' ? 10 : item.type === 'tent_15x15' ? 15 : item.type === 'tent_20x20' ? 20 : 20, 8, item.type === 'tent_10x10' ? 10 : item.type === 'tent_10x20' ? 20 : item.type === 'tent_15x15' ? 15 : item.type === 'tent_20x20' ? 20 : 30);
    const tentMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.position.set(item.x, 4, item.y);
    tent.castShadow = true;
    tent.receiveShadow = true;
    tent.rotation.y = (item.rotation * Math.PI) / 180;
    scene.add(tent);
  };

  const createStage = (scene, item, scale) => {
    const stageGeometry = new THREE.BoxGeometry(item.width || 16, 2, item.length || 20);
    const stageMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(item.x, 1, item.y);
    stage.castShadow = true;
    stage.receiveShadow = true;
    stage.rotation.y = (item.rotation * Math.PI) / 180;
    scene.add(stage);
  };

  const createVideoWall = (scene, item, scale) => {
    const width = item.width || 10;
    const height = item.height || 8;
    const wallGeometry = new THREE.BoxGeometry(width, height, 0.5);
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(item.x, height / 2 + 3, item.y); // On 3ft platform
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.rotation.y = (item.rotation * Math.PI) / 180;
    scene.add(wall);

    // Platform
    const platformGeometry = new THREE.BoxGeometry(width + 2, 3, width + 2);
    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(item.x, 1.5, item.y);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
  };

  const createToilet = (scene, item, scale) => {
    const toiletGeometry = new THREE.BoxGeometry(2, 3, 2);
    const toiletMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const toilet = new THREE.Mesh(toiletGeometry, toiletMaterial);
    toilet.position.set(item.x, 1.5, item.y);
    toilet.castShadow = true;
    toilet.receiveShadow = true;
    scene.add(toilet);
  };

  const createHandwash = (scene, item, scale) => {
    const washGeometry = new THREE.BoxGeometry(1.5, 3, 1.5);
    const washMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
    const wash = new THREE.Mesh(washGeometry, washMaterial);
    wash.position.set(item.x, 1.5, item.y);
    wash.castShadow = true;
    wash.receiveShadow = true;
    scene.add(wash);
  };

  const createSink = (scene, item, scale) => {
    const sinkGeometry = new THREE.BoxGeometry(2, 3, 2);
    const sinkMaterial = new THREE.MeshLambertMaterial({ color: 0x20B2AA });
    const sink = new THREE.Mesh(sinkGeometry, sinkMaterial);
    sink.position.set(item.x, 1.5, item.y);
    sink.castShadow = true;
    sink.receiveShadow = true;
    scene.add(sink);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-screen flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">3D Event Layout</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div ref={containerRef} className="flex-1 relative" />

        <div className="p-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}