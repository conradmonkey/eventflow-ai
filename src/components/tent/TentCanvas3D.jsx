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

    // Dramatic gradient background - deep purples and golds
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#0a0015');
    bgGradient.addColorStop(0.3, '#1a0033');
    bgGradient.addColorStop(0.7, '#2d1b4e');
    bgGradient.addColorStop(1, '#1a0520');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // Twinkling lights/stars
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h * 0.5;
      const size = Math.random() * 3;
      const alpha = Math.random() * 0.8 + 0.2;
      const sparkle = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      sparkle.addColorStop(0, `rgba(255, 220, 150, ${alpha})`);
      sparkle.addColorStop(1, 'rgba(255, 220, 150, 0)');
      ctx.fillStyle = sparkle;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eye-level perspective view
    const vanishingPointX = w / 2;
    const vanishingPointY = h * 0.35;
    const floorY = h * 0.85;

    // Elegant drapes on sides with shimmer
    const drapeWidth = w * 0.15;
    
    // Left drape
    const leftDrapeGradient = ctx.createLinearGradient(0, 0, drapeWidth, 0);
    leftDrapeGradient.addColorStop(0, '#2d1a4a');
    leftDrapeGradient.addColorStop(0.3, '#4a2d6e');
    leftDrapeGradient.addColorStop(0.6, '#6b3fa0');
    leftDrapeGradient.addColorStop(1, 'rgba(107, 63, 160, 0.7)');
    ctx.fillStyle = leftDrapeGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(drapeWidth * 0.5, h * 0.3, drapeWidth * 0.8, floorY);
    ctx.lineTo(0, floorY);
    ctx.closePath();
    ctx.fill();

    // Right drape
    const rightDrapeGradient = ctx.createLinearGradient(w - drapeWidth, 0, w, 0);
    rightDrapeGradient.addColorStop(0, 'rgba(107, 63, 160, 0.7)');
    rightDrapeGradient.addColorStop(0.4, '#6b3fa0');
    rightDrapeGradient.addColorStop(0.7, '#4a2d6e');
    rightDrapeGradient.addColorStop(1, '#2d1a4a');
    ctx.fillStyle = rightDrapeGradient;
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.quadraticCurveTo(w - drapeWidth * 0.5, h * 0.3, w - drapeWidth * 0.8, floorY);
    ctx.lineTo(w, floorY);
    ctx.closePath();
    ctx.fill();

    // Ceiling drapes with golden highlights
    for (let i = 0; i < 5; i++) {
      const x = w * 0.2 + (w * 0.6 / 4) * i;
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 + Math.random() * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(vanishingPointX, vanishingPointY * 0.5, vanishingPointX, vanishingPointY);
      ctx.stroke();
    }

    // Spectacular hanging string lights
    for (let i = 0; i < 12; i++) {
      const x = w * 0.15 + (w * 0.7 / 11) * i;
      const y = vanishingPointY * 0.7 + Math.sin(i * 0.5) * 20;
      
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, '#fff9e6');
      glow.addColorStop(0.4, '#ffd700');
      glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      // Light bulb
      ctx.fillStyle = '#fffacd';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dance floor with spectacular lighting
    const danceFloorCenterX = vanishingPointX;
    const danceFloorCenterY = floorY * 0.8;
    
    const danceFloor = items.find(item => item.type === 'danceFloor');
    if (danceFloor) {
      // Reflective dance floor with color beams
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const beamGradient = ctx.createRadialGradient(
          danceFloorCenterX, danceFloorCenterY, 0,
          danceFloorCenterX + Math.cos(angle) * 200, danceFloorCenterY + Math.sin(angle) * 100, 150
        );
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0080', '#0080ff', '#80ff00'];
        const color = colors[i % colors.length];
        beamGradient.addColorStop(0, `${color}88`);
        beamGradient.addColorStop(0.5, `${color}33`);
        beamGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = beamGradient;
        ctx.fillRect(danceFloorCenterX - 200, danceFloorCenterY - 100, 400, 200);
      }
    }

    // Stage with dramatic spotlights
    const stage = items.find(item => item.type === 'stage');
    if (stage) {
      const stageY = vanishingPointY + 20;
      const stageWidth = w * 0.4;
      
      // Stage structure with depth
      ctx.fillStyle = '#1a0a20';
      ctx.fillRect(vanishingPointX - stageWidth / 2, stageY, stageWidth, h * 0.15);
      
      // Spotlight beams on stage
      for (let i = 0; i < 3; i++) {
        const beamX = vanishingPointX - stageWidth / 3 + (stageWidth / 3) * i;
        const spotGradient = ctx.createRadialGradient(beamX, stageY - 50, 10, beamX, stageY + 50, 80);
        spotGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        spotGradient.addColorStop(0.5, 'rgba(255, 200, 255, 0.4)');
        spotGradient.addColorStop(1, 'rgba(255, 100, 255, 0)');
        ctx.fillStyle = spotGradient;
        ctx.beginPath();
        ctx.moveTo(beamX, stageY - 50);
        ctx.lineTo(beamX - 40, stageY + 100);
        ctx.lineTo(beamX + 40, stageY + 100);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Tables with elegant settings
    const tableItems = items.filter(item => 
      item.type === 'table8ft' || item.type === 'table6ft' || item.type === 'table5ft'
    );
    
    tableItems.forEach((table, idx) => {
      const tableX = w * 0.3 + (idx % 3) * (w * 0.2);
      const tableY = floorY * 0.7 + Math.floor(idx / 3) * 60;
      const tableSize = 40;
      
      // Table with linen
      ctx.fillStyle = tentConfig.linenColor || '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (table.type === 'table5ft') {
        ctx.arc(tableX, tableY, tableSize / 2, 0, Math.PI * 2);
      } else {
        ctx.ellipse(tableX, tableY, tableSize / 2, tableSize / 3, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Centerpiece sparkle
      const sparkleGradient = ctx.createRadialGradient(tableX, tableY - 5, 0, tableX, tableY - 5, 8);
      sparkleGradient.addColorStop(0, '#ffd700');
      sparkleGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = sparkleGradient;
      ctx.beginPath();
      ctx.arc(tableX, tableY - 5, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add glamorous people silhouettes
    const numPeople = Math.min(attendees || 50, 100);
    const peopleCount = Math.floor(numPeople * 0.3); // Show 30% of attendees
    
    for (let i = 0; i < peopleCount; i++) {
      const personX = w * 0.2 + Math.random() * w * 0.6;
      const personY = floorY * 0.65 + Math.random() * floorY * 0.2;
      const personScale = 0.3 + Math.random() * 0.4;
      const personHeight = 40 * personScale;
      
      // Person silhouette with colored lighting
      const colorTint = ['#ff00ff', '#00ffff', '#ffff00'][i % 3];
      ctx.fillStyle = `${colorTint}99`;
      ctx.globalAlpha = 0.7;
      
      // Head
      ctx.beginPath();
      ctx.arc(personX, personY - personHeight, personHeight * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillRect(personX - personHeight * 0.15, personY - personHeight * 0.8, personHeight * 0.3, personHeight * 0.6);
      
      ctx.globalAlpha = 1;
    }

    // Atmospheric light rays from above
    for (let i = 0; i < 5; i++) {
      const rayX = w * 0.2 + (w * 0.6 / 4) * i;
      const rayGradient = ctx.createLinearGradient(rayX, 0, rayX, h * 0.6);
      rayGradient.addColorStop(0, 'rgba(255, 215, 100, 0.15)');
      rayGradient.addColorStop(0.5, 'rgba(255, 180, 200, 0.08)');
      rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(rayX - 20, 0);
      ctx.lineTo(rayX + 20, 0);
      ctx.lineTo(rayX + 60, h * 0.6);
      ctx.lineTo(rayX - 60, h * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    // Foreground atmospheric glow
    const foregroundGlow = ctx.createRadialGradient(vanishingPointX, floorY, 0, vanishingPointX, floorY, w * 0.5);
    foregroundGlow.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    foregroundGlow.addColorStop(0.5, 'rgba(255, 100, 255, 0.05)');
    foregroundGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = foregroundGlow;
    ctx.fillRect(0, floorY * 0.5, w, floorY * 0.5);
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