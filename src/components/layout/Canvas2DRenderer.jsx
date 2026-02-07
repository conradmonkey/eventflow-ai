import React, { useEffect, useRef, useState } from 'react';

const ITEM_SIZES = {
  tent_10x10: { width: 10, height: 10, color: '#3B82F6', label: '10x10' },
  tent_10x20: { width: 10, height: 20, color: '#3B82F6', label: '10x20' },
  tent_15x15: { width: 15, height: 15, color: '#3B82F6', label: '15x15' },
  tent_20x20: { width: 20, height: 20, color: '#3B82F6', label: '20x20' },
  tent_20x30: { width: 20, height: 30, color: '#3B82F6', label: '20x30' },
  video_wall: { width: 4, height: 4, color: '#1E90FF', label: 'Video Wall' },
  toilet: { width: 4, height: 4, color: '#8B4513', label: 'Toilet' },
  handwash: { width: 3, height: 3, color: '#4169E1', label: 'Handwash' },
  sink: { width: 4, height: 4, color: '#20B2AA', label: 'Sink' },
  stage: { width: 16, height: 20, color: '#EF4444', label: 'Stage' },
};

export default function Canvas2DRenderer({
  backgroundImage,
  items,
  scale,
  zoom,
  selectedItem,
  onUpdateItem,
  canvasRef,
}) {
  const containerRef = useRef(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);

  const drawItems = React.useCallback((ctx, canvas) => {
    items.forEach((item, idx) => {
      const size = ITEM_SIZES[item.type];
      if (!size) return;

      const pixelWidth = (size.width / scale) * zoom;
      const pixelHeight = (size.height / scale) * zoom;

      let width = pixelWidth;
      let height = pixelHeight;
      if (item.type === 'video_wall' && item.width && item.height) {
        width = (item.width / scale) * zoom;
        height = (item.height / scale) * zoom;
      } else if (item.type === 'stage' && item.width && item.length) {
        width = (item.width / scale) * zoom;
        height = (item.length / scale) * zoom;
      }

      ctx.save();
      ctx.translate(item.x * zoom, item.y * zoom);
      ctx.rotate((item.rotation * Math.PI) / 180);

      ctx.fillStyle = selectedItem === idx ? '#00FF00' : size.color;
      ctx.fillRect(-width / 2, -height / 2, width, height);

      ctx.strokeStyle = selectedItem === idx ? '#00AA00' : '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(size.label, 0, 0);

      ctx.restore();
    });
  }, [items, scale, zoom, selectedItem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#E0E7FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        drawItems(ctx, canvas);
      };
      img.src = backgroundImage;
    } else {
      drawItems(ctx, canvas);
    }
  }, [backgroundImage, items, scale, zoom, selectedItem, drawItems]);

  const getItemAtPoint = (x, y) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const size = ITEM_SIZES[item.type];
      if (!size) continue;

      const pixelWidth = (size.width / scale) * zoom;
      const pixelHeight = (size.height / scale) * zoom;

      let width = pixelWidth;
      let height = pixelHeight;
      if (item.type === 'video_wall' && item.width && item.height) {
        width = (item.width / scale) * zoom;
        height = (item.height / scale) * zoom;
      } else if (item.type === 'stage' && item.width && item.length) {
        width = (item.width / scale) * zoom;
        height = (item.length / scale) * zoom;
      }

      const itemX = item.x * zoom;
      const itemY = item.y * zoom;

      if (
        x >= itemX - width / 2 &&
        x <= itemX + width / 2 &&
        y >= itemY - height / 2 &&
        y <= itemY + height / 2
      ) {
        return i;
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
      setDraggingItem(itemIdx);
      setDragStart({ x, y, itemX: items[itemIdx].x, itemY: items[itemIdx].y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggingItem !== null && dragStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = (x - dragStart.x) / zoom;
      const dy = (y - dragStart.y) / zoom;

      onUpdateItem(draggingItem, {
        x: dragStart.itemX + dx,
        y: dragStart.itemY + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
    setDragStart(null);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const itemIdx = getItemAtPoint(x, y);
    if (itemIdx !== null) {
      onUpdateItem(itemIdx, {
        rotation: (items[itemIdx].rotation + 15) % 360,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-slate-200"
      style={{ height: '600px' }}
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