import React, { useEffect, useRef, useState, useCallback } from 'react';

const ITEM_SIZES = {
  tent_8x8: { width: 8, height: 8, color: '#3B82F6', label: '8x8 Tent' },
  tent_10x10: { width: 10, height: 10, color: '#3B82F6', label: '10x10 Tent' },
  tent_10x20: { width: 10, height: 20, color: '#3B82F6', label: '10x20 Tent' },
  tent_15x15: { width: 15, height: 15, color: '#3B82F6', label: '15x15 Tent' },
  tent_20x20: { width: 20, height: 20, color: '#3B82F6', label: '20x20 Tent' },
  tent_20x30: { width: 20, height: 30, color: '#3B82F6', label: '20x30 Tent' },
  tent_30x30: { width: 30, height: 30, color: '#3B82F6', label: '30x30 Tent' },
  frame_tent: { width: 20, height: 30, color: '#2563EB', label: 'Frame Tent' },
  video_wall: { width: 2, height: 8, color: '#1E90FF', label: 'Video Wall' },
  toilet: { width: 5, height: 5, color: '#000000', label: 'Toilet' },
  handwash: { width: 3, height: 3, color: '#4169E1', label: 'Handwash' },
  sink: { width: 4, height: 4, color: '#20B2AA', label: 'Sink' },
  stage: { width: 16, height: 20, color: '#EF4444', label: 'Stage' },
  custom: { width: 10, height: 10, color: '#808080', label: 'Custom' },
};

export default function Canvas2DRenderer({
  backgroundImage,
  items,
  scale,
  zoom,
  selectedItem,
  onUpdateItem,
  canvasRef,
  showLegend = true,
}) {
  const containerRef = useRef(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [moveMode, setMoveMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
  }, []);

  const drawItems = useCallback((ctx, canvas) => {
    items.forEach((item, idx) => {
      const size = ITEM_SIZES[item.type];
      if (!size) return;

      // Convert feet to inches on canvas: (feet / scale) * 96 pixels per inch
      const INCH_TO_PIXELS = 96; // 1 inch = 96 pixels at 96 DPI
      let width = (size.width / scale) * INCH_TO_PIXELS * zoom;
      let height = (size.height / scale) * INCH_TO_PIXELS * zoom;

      if (item.type === 'video_wall') {
        width = (item.width || 2) / scale * INCH_TO_PIXELS * zoom;
        height = ((item.length || item.height || size.height) / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'stage' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'frame_tent' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'custom' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
      }

      ctx.save();
      ctx.translate(item.x * zoom, item.y * zoom);
      ctx.rotate((item.rotation * Math.PI) / 180);

      ctx.fillStyle = selectedItem === idx ? '#00FF00' : (item.color || size.color);
      ctx.fillRect(-width / 2, -height / 2, width, height);

      ctx.strokeStyle = selectedItem === idx ? '#00AA00' : '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = item.type === 'custom' ? item.name : size.label;
      ctx.fillText(label, 0, 0);

      ctx.restore();
    });
  }, [items, scale, zoom, selectedItem]);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Ensure canvas is properly sized
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#E0E7FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawItems(ctx, canvas);
      };
      img.onerror = () => {
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

      const INCH_TO_PIXELS = 96;
      let width = (size.width / scale) * INCH_TO_PIXELS * zoom;
      let height = (size.height / scale) * INCH_TO_PIXELS * zoom;

      if (item.type === 'video_wall') {
        width = (item.width || 2) / scale * INCH_TO_PIXELS * zoom;
        height = ((item.length || item.height || size.height) / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'stage' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'frame_tent' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
      } else if (item.type === 'custom' && item.width && item.length) {
        width = (item.width / scale) * INCH_TO_PIXELS * zoom;
        height = (item.length / scale) * INCH_TO_PIXELS * zoom;
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

  const handleStart = (e) => {
    const isTouch = e.touches !== undefined;
    if (isTouch && !moveMode) return;
    
    if (isTouch) {
      e.preventDefault();
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    const x = (touch.clientX || e.clientX) - rect.left;
    const y = (touch.clientY || e.clientY) - rect.top;

    const itemIdx = getItemAtPoint(x, y);
    if (itemIdx !== null) {
      setDraggingItem(itemIdx);
      setDragStart({ x, y, itemX: items[itemIdx].x, itemY: items[itemIdx].y });
    }
  };

  const handleMove = (e) => {
    if (draggingItem === null || !dragStart) return;
    
    const isTouch = e.touches !== undefined;
    if (isTouch && !moveMode) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    const x = (touch.clientX || e.clientX) - rect.left;
    const y = (touch.clientY || e.clientY) - rect.top;

    const dx = (x - dragStart.x) / zoom;
    const dy = (y - dragStart.y) / zoom;

    onUpdateItem(draggingItem, {
      x: dragStart.itemX + dx,
      y: dragStart.itemY + dy,
    });
  };

  const handleEnd = () => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedItem !== null) {
      const newItems = items.filter((_, i) => i !== selectedItem);
      onUpdateItem(null, null); // Clear selection
      // Notify parent to update items
      if (window.onDeleteSelectedItem) {
        window.onDeleteSelectedItem(selectedItem);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items]);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-slate-200 relative"
      style={{ height: '600px', touchAction: moveMode ? 'none' : 'auto' }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        onContextMenu={handleContextMenu}
        style={{ touchAction: moveMode ? 'none' : 'auto' }}
        className={`w-full h-full ${moveMode ? 'cursor-move' : 'cursor-default'} block`}
      />
      {isMobile && (
        <button
          onClick={() => setMoveMode(!moveMode)}
          className={`absolute top-4 left-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all z-50 ${
            moveMode 
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg' 
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          {moveMode ? '✓ Move Mode' : 'Move Mode'}
        </button>
      )}
      <div className="absolute bottom-4 left-4 text-xs text-slate-600 bg-white px-2 py-1 rounded">
        {isMobile ? (moveMode ? 'Drag items to move them' : 'Enable Move Mode to drag items') : 'Drag to move'} • Right-click to rotate • Delete key to remove
      </div>
      
      {/* Color Legend */}
      {showLegend && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200">
        <h4 className="font-semibold text-xs mb-2 text-slate-700">Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-xs text-slate-600">Popup Tents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-xs text-slate-600">Marquee Tents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2563EB' }}></div>
            <span className="text-xs text-slate-600">Frame Tents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-xs text-slate-600">Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E90FF' }}></div>
            <span className="text-xs text-slate-600">Video Wall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#000000' }}></div>
            <span className="text-xs text-slate-600">Toilet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4169E1' }}></div>
            <span className="text-xs text-slate-600">Handwash</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#20B2AA' }}></div>
            <span className="text-xs text-slate-600">Sink</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}