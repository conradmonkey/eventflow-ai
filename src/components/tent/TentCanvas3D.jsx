import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TentCanvas3D({ tentConfig, items, onClose, attendees, tentType, tentStyle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Isometric helper functions
    const isoX = (x, y) => (x - y) * Math.cos(Math.PI / 6);
    const isoY = (x, y, z = 0) => (x + y) * Math.sin(Math.PI / 6) - z;

    // Dark elegant background
    const bgGradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Subtle stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 80; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h * 0.5, Math.random() * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Isometric scaling and positioning
    const scale = Math.min(w, h) / 80;
    const centerX = w / 2;
    const centerY = h * 0.55;

    const tentW = Math.max(tentConfig.width || 40, 30);
    const tentL = Math.max(tentConfig.length || 60, 40);
    const tentH = 12;

    // Draw ground/floor plane (luxury flooring)
    const drawIsoRect = (x, y, width, length, z, color1, color2, color3) => {
      const x1 = centerX + isoX(x, y) * scale;
      const y1 = centerY + isoY(x, y, z) * scale;
      const x2 = centerX + isoX(x + width, y) * scale;
      const y2 = centerY + isoY(x + width, y, z) * scale;
      const x3 = centerX + isoX(x + width, y + length) * scale;
      const y3 = centerY + isoY(x + width, y + length, z) * scale;
      const x4 = centerX + isoX(x, y + length) * scale;
      const y4 = centerY + isoY(x, y + length, z) * scale;

      // Top face
      ctx.fillStyle = color1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();

      // Right face
      if (color2) {
        const x5 = centerX + isoX(x + width, y + length) * scale;
        const y5 = centerY + isoY(x + width, y + length, 0) * scale;
        ctx.fillStyle = color2;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.lineTo(x5, y5);
        ctx.lineTo(centerX + isoX(x + width, y) * scale, centerY + isoY(x + width, y, 0) * scale);
        ctx.closePath();
        ctx.fill();
      }

      // Left face
      if (color3) {
        const x6 = centerX + isoX(x, y + length) * scale;
        const y6 = centerY + isoY(x, y + length, 0) * scale;
        ctx.fillStyle = color3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x4, y4);
        ctx.lineTo(x6, y6);
        ctx.lineTo(centerX + isoX(x, y) * scale, centerY + isoY(x, y, 0) * scale);
        ctx.closePath();
        ctx.fill();
      }
    };

    // Luxury marble floor
    drawIsoRect(-tentW / 2, -tentL / 2, tentW, tentL, 0, '#2d2d3f', '#25253a', '#1f1f30');

    // Floor pattern (marble tiles)
    for (let i = 0; i < tentW; i += 5) {
      for (let j = 0; j < tentL; j += 5) {
        const tileX = -tentW / 2 + i;
        const tileY = -tentL / 2 + j;
        const brightness = ((i + j) % 10 === 0) ? 5 : 0;
        const tileColor = `rgba(255, 255, 255, ${0.02 + brightness * 0.008})`;
        
        const tx1 = centerX + isoX(tileX, tileY) * scale;
        const ty1 = centerY + isoY(tileX, tileY, 0) * scale;
        const tx2 = centerX + isoX(tileX + 5, tileY) * scale;
        const ty2 = centerY + isoY(tileX + 5, tileY, 0) * scale;
        const tx3 = centerX + isoX(tileX + 5, tileY + 5) * scale;
        const ty3 = centerY + isoY(tileX + 5, tileY + 5, 0) * scale;
        const tx4 = centerX + isoX(tileX, tileY + 5) * scale;
        const ty4 = centerY + isoY(tileX, tileY + 5, 0) * scale;

        ctx.strokeStyle = tileColor;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.lineTo(tx3, ty3);
        ctx.lineTo(tx4, ty4);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Tent structure walls
    if (tentStyle === 'marquee') {
      // Marquee peaked roof
      const peakH = tentH + 5;
      
      // Back wall
      ctx.fillStyle = 'rgba(250, 250, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();

      // Left wall
      ctx.fillStyle = 'rgba(245, 245, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();

      // Peaked roof (two slopes)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(0, -tentL / 2) * scale, centerY + isoY(0, -tentL / 2, peakH) * scale);
      ctx.lineTo(centerX + isoX(0, tentL / 2) * scale, centerY + isoY(0, tentL / 2, peakH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(245, 245, 250, 0.9)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(0, -tentL / 2) * scale, centerY + isoY(0, -tentL / 2, peakH) * scale);
      ctx.lineTo(centerX + isoX(0, tentL / 2) * scale, centerY + isoY(0, tentL / 2, peakH) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, tentL / 2) * scale, centerY + isoY(tentW / 2, tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();
    } else {
      // Frame tent - flat roof
      // Back wall
      ctx.fillStyle = 'rgba(250, 250, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();

      // Left wall
      ctx.fillStyle = 'rgba(245, 245, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, 0) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();

      // Flat roof
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.moveTo(centerX + isoX(-tentW / 2, -tentL / 2) * scale, centerY + isoY(-tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, -tentL / 2) * scale, centerY + isoY(tentW / 2, -tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(tentW / 2, tentL / 2) * scale, centerY + isoY(tentW / 2, tentL / 2, tentH) * scale);
      ctx.lineTo(centerX + isoX(-tentW / 2, tentL / 2) * scale, centerY + isoY(-tentW / 2, tentL / 2, tentH) * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Stage
    const stages = items.filter(item => item.type === 'stage');
    if (stages.length > 0) {
      const stageW = 20;
      const stageL = 16;
      const stageH = 3;
      drawIsoRect(-stageW / 2, -tentL / 2 + 5, stageW, stageL, stageH, '#1a1a1a', '#0f0f0f', '#080808');
      
      // Stage lighting
      for (let i = 0; i < 3; i++) {
        const lx = -stageW / 2 + (stageW / 4) * (i + 0.5);
        const ly = -tentL / 2 + 12;
        const sx = centerX + isoX(lx, ly) * scale;
        const sy = centerY + isoY(lx, ly, stageH) * scale;
        
        const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 60 * scale);
        spotGrad.addColorStop(0, 'rgba(255, 220, 150, 0.4)');
        spotGrad.addColorStop(1, 'rgba(255, 200, 120, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, 60 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dance floor
    const danceFloors = items.filter(item => item.type === 'danceFloor');
    if (danceFloors.length > 0) {
      const dfW = 18;
      const dfL = 18;
      drawIsoRect(-dfW / 2, -dfL / 2, dfW, dfL, 0.2, '#d4af37', '#c19f2f', '#b08f28');
      
      // Disco lights effect
      const colors = ['#ff6b9d', '#4ecdc4', '#ffe66d', '#a8e6cf'];
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const lx = Math.cos(angle) * 6;
        const ly = Math.sin(angle) * 6;
        const sx = centerX + isoX(lx, ly) * scale;
        const sy = centerY + isoY(lx, ly, 0.2) * scale;
        
        const colorGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 40 * scale);
        colorGrad.addColorStop(0, colors[i] + 'aa');
        colorGrad.addColorStop(1, colors[i] + '00');
        ctx.fillStyle = colorGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, 40 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tables with elegant styling
    const tables = items.filter(item => 
      item.type === 'table8ft' || item.type === 'table6ft' || item.type === 'table5ft'
    );
    
    tables.slice(0, 12).forEach((table, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const tableX = -tentW / 3 + (tentW / 5) * col;
      const tableY = tentL / 4 - row * 12;
      const tableSize = table.type === 'table5ft' ? 4 : 6;
      
      // Table top
      drawIsoRect(tableX - tableSize / 2, tableY - tableSize / 2, tableSize, tableSize, 2.5, 
        tentConfig.linenColor || '#ffffff', 
        'rgba(230, 230, 235, 0.95)', 
        'rgba(225, 225, 230, 0.9)');
      
      // Centerpiece glow
      const tx = centerX + isoX(tableX, tableY) * scale;
      const ty = centerY + isoY(tableX, tableY, 3) * scale;
      const cpGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 15);
      cpGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      cpGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
      ctx.fillStyle = cpGrad;
      ctx.beginPath();
      ctx.arc(tx, ty, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Chandelier lighting from ceiling
    for (let i = 0; i < 6; i++) {
      const lx = -tentW / 3 + (tentW / 3) * (i % 3);
      const ly = -tentL / 4 + (tentL / 2) * Math.floor(i / 3);
      const sx = centerX + isoX(lx, ly) * scale;
      const sy = centerY + isoY(lx, ly, tentH - 1) * scale;
      
      // Chandelier crystal
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Warm glow
      const chandelierGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 80 * scale);
      chandelierGrad.addColorStop(0, 'rgba(255, 245, 220, 0.3)');
      chandelierGrad.addColorStop(0.5, 'rgba(255, 235, 200, 0.15)');
      chandelierGrad.addColorStop(1, 'rgba(255, 220, 180, 0)');
      ctx.fillStyle = chandelierGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, 80 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Elegant people silhouettes
    const numPeople = Math.min(attendees || 50, 100);
    const peopleToShow = Math.min(Math.floor(numPeople * 0.3), 40);
    
    for (let i = 0; i < peopleToShow; i++) {
      const px = -tentW / 3 + Math.random() * (tentW * 0.6);
      const py = -tentL / 3 + Math.random() * (tentL * 0.6);
      const personHeight = 5;
      
      const sx = centerX + isoX(px, py) * scale;
      const sy = centerY + isoY(px, py, 0) * scale;
      
      ctx.fillStyle = `hsla(${200 + Math.random() * 60}, 50%, 50%, 0.7)`;
      ctx.beginPath();
      ctx.ellipse(sx, sy - personHeight * scale, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Info display
    if (tentType) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${tentType} ${tentStyle === 'marquee' ? 'Marquee' : 'Frame'} Tent`, 20, 35);
      ctx.font = '16px Arial';
      ctx.fillText(`${attendees} Guests • Luxury Isometric View`, 20, 60);
    }
  }, [tentConfig, items, attendees, tentType, tentStyle]);

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