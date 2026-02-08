import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TentCanvas3D({ tentConfig, items, onClose, attendees }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Elegant evening sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, h);
    skyGradient.addColorStop(0, '#0d1b2a');
    skyGradient.addColorStop(0.4, '#1b263b');
    skyGradient.addColorStop(1, '#415a77');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, w, h);

    // Soft twinkling stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h * 0.4, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floor with perspective
    const horizon = h * 0.4;
    const floorGradient = ctx.createLinearGradient(0, horizon, 0, h);
    floorGradient.addColorStop(0, '#2c3e50');
    floorGradient.addColorStop(0.5, '#34495e');
    floorGradient.addColorStop(1, '#1a252f');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, horizon, w, h - horizon);

    // Tent ceiling with elegant white draping
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, horizon * 0.8);
    ctx.quadraticCurveTo(w / 2, horizon * 1.1, 0, horizon * 0.8);
    ctx.closePath();
    ctx.fill();

    // Ceiling drape details
    for (let i = 0; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(w / 2, horizon * 0.9, w / 2, horizon);
      ctx.stroke();
    }

    // Side drapes - flowing and elegant
    ctx.fillStyle = 'rgba(240, 240, 245, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w * 0.08, h * 0.3, w * 0.12, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.quadraticCurveTo(w * 0.92, h * 0.3, w * 0.88, h);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // String lights with warm glow
    const numLights = 20;
    for (let i = 0; i < numLights; i++) {
      const x = (w / numLights) * i + w / (numLights * 2);
      const y = horizon * 0.65 + Math.sin(i * 0.8) * 15;
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 20);
      glow.addColorStop(0, 'rgba(255, 230, 180, 0.8)');
      glow.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
      glow.addColorStop(1, 'rgba(255, 180, 80, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fffacd';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stage area
    const stages = items.filter(item => item.type === 'stage');
    if (stages.length > 0) {
      const stageY = horizon * 0.9;
      const stageW = w * 0.5;
      const stageH = h * 0.2;
      
      // Stage platform
      ctx.fillStyle = '#2c2c2c';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillRect(w / 2 - stageW / 2, stageY, stageW, stageH);
      ctx.shadowBlur = 0;

      // Stage lighting - multiple spotlights
      for (let i = 0; i < 4; i++) {
        const spotX = w / 2 - stageW / 3 + (stageW / 2.5) * i;
        const spotGradient = ctx.createRadialGradient(spotX, stageY + stageH / 2, 0, spotX, stageY + stageH / 2, 120);
        spotGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        spotGradient.addColorStop(0.3, 'rgba(255, 220, 180, 0.3)');
        spotGradient.addColorStop(1, 'rgba(255, 200, 150, 0)');
        ctx.fillStyle = spotGradient;
        ctx.beginPath();
        ctx.arc(spotX, stageY + stageH / 2, 120, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dance floor with shimmer
    const danceFloors = items.filter(item => item.type === 'danceFloor');
    if (danceFloors.length > 0) {
      const dfY = h * 0.65;
      const dfW = w * 0.4;
      const dfH = h * 0.25;
      
      // Reflective floor
      ctx.fillStyle = danceFloors[0].color || '#d4af37';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.fillRect(w / 2 - dfW / 2, dfY, dfW, dfH);
      ctx.shadowBlur = 0;

      // Light reflections
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const colors = ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#c7ceea'];
        const refGradient = ctx.createRadialGradient(
          w / 2 + Math.cos(angle) * 50, dfY + dfH / 2 + Math.sin(angle) * 30, 0,
          w / 2 + Math.cos(angle) * 50, dfY + dfH / 2 + Math.sin(angle) * 30, 60
        );
        refGradient.addColorStop(0, `${colors[i]}66`);
        refGradient.addColorStop(1, `${colors[i]}00`);
        ctx.fillStyle = refGradient;
        ctx.beginPath();
        ctx.arc(w / 2 + Math.cos(angle) * 50, dfY + dfH / 2 + Math.sin(angle) * 30, 60, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tables with elegant settings
    const tables = items.filter(item => 
      item.type === 'table8ft' || item.type === 'table6ft' || item.type === 'table5ft'
    );
    
    const tableY = h * 0.7;
    tables.slice(0, 8).forEach((table, idx) => {
      const spacing = w * 0.12;
      const tableX = w * 0.15 + (idx % 4) * spacing;
      const tableRow = tableY + Math.floor(idx / 4) * 80;
      
      // Table shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(tableX, tableRow + 5, 30, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Table with linen
      ctx.fillStyle = tentConfig.linenColor || '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (table.type === 'table5ft') {
        ctx.arc(tableX, tableRow, 28, 0, Math.PI * 2);
      } else {
        ctx.ellipse(tableX, tableRow, 35, 20, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Elegant centerpiece
      const cpGradient = ctx.createRadialGradient(tableX, tableRow - 8, 0, tableX, tableRow - 8, 12);
      cpGradient.addColorStop(0, '#ffd700');
      cpGradient.addColorStop(0.6, '#ffb347');
      cpGradient.addColorStop(1, 'rgba(255, 179, 71, 0)');
      ctx.fillStyle = cpGradient;
      ctx.beginPath();
      ctx.arc(tableX, tableRow - 8, 12, 0, Math.PI * 2);
      ctx.fill();

      // Centerpiece detail
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(tableX, tableRow - 8, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Glamorous people silhouettes
    const numPeople = Math.min(attendees || 50, 150);
    const peopleToShow = Math.min(Math.floor(numPeople * 0.4), 50);
    
    for (let i = 0; i < peopleToShow; i++) {
      const zone = Math.random();
      let personX, personY, personScale;
      
      if (zone < 0.5) {
        // Dance floor area
        personX = w * 0.35 + Math.random() * w * 0.3;
        personY = h * 0.68 + Math.random() * h * 0.15;
        personScale = 0.8 + Math.random() * 0.4;
      } else {
        // Around tables
        personX = w * 0.15 + Math.random() * w * 0.7;
        personY = h * 0.72 + Math.random() * h * 0.12;
        personScale = 0.6 + Math.random() * 0.3;
      }
      
      const personH = 50 * personScale;
      const hue = Math.random() * 60 + 200; // Blue to purple range
      
      ctx.fillStyle = `hsla(${hue}, 60%, 60%, 0.7)`;
      ctx.globalAlpha = 0.85;
      
      // Head
      ctx.beginPath();
      ctx.arc(personX, personY - personH * 0.85, personH * 0.15, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.beginPath();
      ctx.moveTo(personX - personH * 0.12, personY - personH * 0.7);
      ctx.lineTo(personX + personH * 0.12, personY - personH * 0.7);
      ctx.lineTo(personX + personH * 0.15, personY);
      ctx.lineTo(personX - personH * 0.15, personY);
      ctx.closePath();
      ctx.fill();
      
      ctx.globalAlpha = 1;
    }

    // Atmospheric lighting effects
    const ambientGlow = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, w * 0.6);
    ambientGlow.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
    ambientGlow.addColorStop(0.5, 'rgba(255, 220, 180, 0.08)');
    ambientGlow.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, horizon * 0.6, w, h);

    // Soft light beams from ceiling
    for (let i = 0; i < 4; i++) {
      const beamX = w * 0.25 + (w * 0.5 / 3) * i;
      const beamGradient = ctx.createLinearGradient(beamX, horizon * 0.5, beamX, h * 0.7);
      beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = beamGradient;
      ctx.fillRect(beamX - 30, horizon * 0.5, 60, h * 0.3);
    }
  }, [tentConfig, items, attendees]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-white">Artistic Event Visualization</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>
        <div className="flex-1 p-4">
          <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}