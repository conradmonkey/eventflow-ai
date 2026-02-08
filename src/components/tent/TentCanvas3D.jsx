import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function TentCanvas3D({ tentConfig, items, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Artistic gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add stars/ambient lights
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height * 0.6, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const scale = Math.min(
      (canvas.width - 200) / tentConfig.length,
      (canvas.height - 300) / tentConfig.width
    );

    const offsetX = canvas.width / 2;
    const offsetY = canvas.height - 100;

    // Draw elegant tent with perspective
    const tentWidth = tentConfig.length * scale;
    const tentDepth = tentConfig.width * scale * 0.6;
    
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY, tentWidth / 2 + 20, tentDepth / 2 + 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tent base (trapezoid for perspective)
    ctx.fillStyle = '#f5f5dc';
    ctx.strokeStyle = '#dcdcaa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(offsetX - tentWidth / 2, offsetY);
    ctx.lineTo(offsetX + tentWidth / 2, offsetY);
    ctx.lineTo(offsetX + tentWidth / 2.5, offsetY - tentDepth);
    ctx.lineTo(offsetX - tentWidth / 2.5, offsetY - tentDepth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tent roof peak
    const peakHeight = 150;
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.moveTo(offsetX - tentWidth / 2, offsetY);
    ctx.lineTo(offsetX, offsetY - peakHeight);
    ctx.lineTo(offsetX + tentWidth / 2, offsetY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Roof side
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.moveTo(offsetX - tentWidth / 2.5, offsetY - tentDepth);
    ctx.lineTo(offsetX, offsetY - peakHeight - tentDepth * 0.3);
    ctx.lineTo(offsetX + tentWidth / 2.5, offsetY - tentDepth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Decorative string lights
    for (let i = 0; i < 6; i++) {
      const x = offsetX - tentWidth / 2.5 + (tentWidth / 2.2) * (i / 5);
      const y = offsetY - tentDepth - 20 - Math.sin((i / 5) * Math.PI) * 10;
      
      const lightGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      lightGradient.addColorStop(0, '#ffeb3b');
      lightGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
      ctx.fillStyle = lightGradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw items inside tent with artistic flair
    items.forEach(item => {
      const itemX = offsetX + (item.x - tentConfig.length / 2) * scale;
      const itemY = offsetY - (item.y - tentConfig.width / 2) * scale * 0.6;
      
      ctx.save();
      
      if (item.type === 'stage') {
        // Stage with spotlight effect
        const spotlightGradient = ctx.createRadialGradient(itemX, itemY - 80, 0, itemX, itemY - 80, 100);
        spotlightGradient.addColorStop(0, 'rgba(255, 182, 193, 0.4)');
        spotlightGradient.addColorStop(1, 'rgba(255, 182, 193, 0)');
        ctx.fillStyle = spotlightGradient;
        ctx.fillRect(itemX - 50, itemY - 150, 100, 150);
        
        ctx.fillStyle = item.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(itemX - item.width * scale / 2, itemY - 20, item.width * scale, item.length * scale * 0.4);
      } else if (item.type === 'danceFloor') {
        const floorGradient = ctx.createLinearGradient(itemX - item.width * scale / 2, itemY, itemX + item.width * scale / 2, itemY);
        floorGradient.addColorStop(0, item.color);
        floorGradient.addColorStop(0.5, '#ffffff');
        floorGradient.addColorStop(1, item.color);
        ctx.fillStyle = floorGradient;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(itemX - item.width * scale / 2, itemY, item.width * scale, item.length * scale * 0.4);
        ctx.globalAlpha = 1;
      } else if (item.type === 'table8ft' || item.type === 'table6ft' || item.type === 'table5ft') {
        ctx.fillStyle = item.color || '#8B4513';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        if (item.type === 'table5ft') {
          ctx.beginPath();
          ctx.arc(itemX, itemY, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(itemX - 15, itemY - 5, 30, 10);
        }
      } else if (item.type === 'customEquipment') {
        ctx.fillStyle = item.color;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fillRect(
          itemX - (item.width * scale) / 2,
          itemY - (item.length * scale * 0.4) / 2,
          item.width * scale,
          item.length * scale * 0.4
        );
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, itemX, itemY);
      }
      
      ctx.restore();
    });

    // Ambient light effects
    ctx.fillStyle = 'rgba(255, 223, 186, 0.1)';
    ctx.beginPath();
    ctx.ellipse(offsetX, offsetY - 100, tentWidth / 2 - 50, 80, 0, 0, Math.PI * 2);
    ctx.fill();
  }, [tentConfig, items]);

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