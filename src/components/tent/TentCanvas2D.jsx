import React, { useEffect, useRef, useState } from 'react';

export default function TentCanvas2D({ tentConfig, items, setItems, canvasRef }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tent outline
    if (tentConfig.length > 0 && tentConfig.width > 0) {
      const scale = Math.min(
        (canvas.width - 100) / tentConfig.length,
        (canvas.height - 100) / tentConfig.width
      );

      const tentWidth = tentConfig.length * scale;
      const tentHeight = tentConfig.width * scale;
      const offsetX = (canvas.width - tentWidth) / 2;
      const offsetY = (canvas.height - tentHeight) / 2;

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(offsetX, offsetY, tentWidth, tentHeight);

      // Draw items
      items.forEach((item, idx) => {
        ctx.save();
        const itemX = offsetX + item.x * scale;
        const itemY = offsetY + item.y * scale;
        ctx.translate(itemX, itemY);
        ctx.rotate((item.rotation || 0) * Math.PI / 180);

        if (item.type === 'stage') {
          const w = item.width * scale;
          const h = item.length * scale;
          ctx.fillStyle = item.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'videoWall') {
          const w = item.width * scale;
          const h = 1 * scale;
          ctx.fillStyle = item.color || '#1E90FF';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'danceFloor') {
          const w = item.width * scale;
          const h = item.length * scale;
          ctx.fillStyle = item.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'table8ft') {
          const w = 8 * scale;
          const h = 2.5 * scale;
          ctx.fillStyle = item.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'table6ft') {
          const w = 6 * scale;
          const h = 2.5 * scale;
          ctx.fillStyle = item.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'table5ft') {
          const r = 2.5 * scale;
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.stroke();
        } else if (item.type === 'bar') {
          const w = item.width * scale;
          const h = item.length * scale;
          ctx.fillStyle = '#654321';
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
        } else if (item.type === 'cocktailTable') {
          const r = 1.25 * scale;
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.stroke();
        } else if (item.type === 'chair') {
          const w = 1.5 * scale;
          const h = 1.5 * scale;
          const seatColor = selectedGroup === item.groupId ? '#00FF00' : '#8B4513';
          
          // Draw chair back
          ctx.fillStyle = seatColor;
          ctx.fillRect(-w / 2, -h / 2 - 0.3 * scale, w, 0.4 * scale);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2 - 0.3 * scale, w, 0.4 * scale);
          
          // Draw seat
          ctx.fillStyle = seatColor;
          ctx.fillRect(-w / 2, -h / 4, w, h / 2);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 4, w, h / 2);
          
          // Draw legs
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          const legX1 = -w / 3;
          const legX2 = w / 3;
          const legTop = h / 4;
          const legBottom = h / 2;
          ctx.beginPath();
          ctx.moveTo(legX1, legTop);
          ctx.lineTo(legX1, legBottom);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(legX2, legTop);
          ctx.lineTo(legX2, legBottom);
          ctx.stroke();
        } else if (item.type === 'customEquipment') {
          const w = item.width * scale;
          const h = item.length * scale;
          ctx.fillStyle = item.color;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(-w / 2, -h / 2, w, h);
          // Draw label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.name, 0, 0);
        }

        ctx.restore();
      });
    }
  }, [tentConfig, items, selectedGroup]);

  const getItemAtPoint = (x, y) => {
    const canvas = canvasRef.current;
    const scale = Math.min(
      (canvas.width - 100) / tentConfig.length,
      (canvas.height - 100) / tentConfig.width
    );
    const offsetX = (canvas.width - tentConfig.length * scale) / 2;
    const offsetY = (canvas.height - tentConfig.width * scale) / 2;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const itemX = offsetX + item.x * scale;
      const itemY = offsetY + item.y * scale;

      const dx = x - itemX;
      const dy = y - itemY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (item.type === 'table5ft' || item.type === 'cocktailTable') {
        const r = (item.diameter || 5) / 2 * scale;
        if (dist < r) return i;
      } else {
        const w = (item.width || 2) * scale / 2;
        const h = (item.length || item.height || 2) * scale / 2;
        if (Math.abs(dx) < w && Math.abs(dy) < h) return i;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const itemIdx = getItemAtPoint(x, y);
    if (itemIdx !== null) {
      const item = items[itemIdx];
      if (item.groupId) {
        setSelectedGroup(item.groupId);
      }
      setDragging(itemIdx);
      setDragStart({ x, y, itemX: item.x, itemY: item.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging !== null && dragStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scale = Math.min(
        (canvasRef.current.width - 100) / tentConfig.length,
        (canvasRef.current.height - 100) / tentConfig.width
      );

      const dx = (x - dragStart.x) / scale;
      const dy = (y - dragStart.y) / scale;

      const item = items[dragging];
      if (item.groupId) {
        setItems(prev => prev.map(itm =>
          itm.groupId === item.groupId
            ? { ...itm, x: itm.x + dx, y: itm.y + dy }
            : itm
        ));
      } else {
        setItems(prev => prev.map((itm, idx) =>
          idx === dragging ? { ...itm, x: dragStart.itemX + dx, y: dragStart.itemY + dy } : itm
        ));
      }
      setDragStart({ x, y, itemX: dragStart.itemX + dx, itemY: dragStart.itemY + dy });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setDragStart(null);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const itemIdx = getItemAtPoint(x, y);
    if (itemIdx !== null) {
      const item = items[itemIdx];
      if (item.groupId) {
        setItems(prev => prev.map(itm =>
          itm.groupId === item.groupId
            ? { ...itm, rotation: (itm.rotation || 0) + 15 }
            : itm
        ));
      } else {
        setItems(prev => prev.map((itm, idx) =>
          idx === itemIdx ? { ...itm, rotation: (itm.rotation || 0) + 15 } : itm
        ));
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg border-2 border-slate-200 relative"
      style={{ height: '700px' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        className="w-full h-full cursor-move"
      />
      <div className="absolute bottom-4 left-4 text-xs text-slate-600 bg-white px-2 py-1 rounded">
        Drag to move • Right-click to rotate
      </div>
    </div>
  );
}