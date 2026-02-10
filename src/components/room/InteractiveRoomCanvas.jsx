import { useState, useRef, useEffect } from "react";

export default function InteractiveRoomCanvas({ formData, items: externalItems, onItemsChange }) {
  const canvasRef = useRef(null);
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Update items when external items change
  useEffect(() => {
    if (externalItems && externalItems.length > 0) {
      setItems(externalItems);
    }
  }, [externalItems]);

  // Calculate scale when formData changes
  useEffect(() => {
    if (!formData.room_length || !formData.room_width || !canvasRef.current) return;

    const containerWidth = canvasRef.current.offsetWidth;
    const containerHeight = canvasRef.current.offsetHeight;
    
    const roomLength = parseFloat(formData.room_length);
    const roomWidth = parseFloat(formData.room_width);
    
    // Calculate scale for both orientations and pick the one that maximizes room size
    const padding = 20;
    const scaleNormal = Math.min(
      (containerWidth - padding * 2) / roomLength,
      (containerHeight - padding * 2) / roomWidth
    );
    const scaleRotated = Math.min(
      (containerWidth - padding * 2) / roomWidth,
      (containerHeight - padding * 2) / roomLength
    );
    
    // Use rotated orientation if it gives larger scale
    const isRotated = scaleRotated > scaleNormal;
    const scale = Math.max(scaleNormal, scaleRotated);
    
    const scaledRoomLength = (isRotated ? roomWidth : roomLength) * scale;
    const scaledRoomWidth = (isRotated ? roomLength : roomWidth) * scale;
    
    setCanvasSize({ 
      width: scaledRoomLength, 
      height: scaledRoomWidth,
      scale,
      offsetX: (containerWidth - scaledRoomLength) / 2,
      offsetY: (containerHeight - scaledRoomWidth) / 2,
      isRotated
    });
  }, [formData.room_length, formData.room_width]);

  const handleMouseDown = (e, item) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y
    });
    setDraggedItem(item.id);
  };

  const handleMouseMove = (e) => {
    if (!draggedItem) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - offset.x;
    const y = e.clientY - rect.top - offset.y;
    
    const updatedItems = items.map(item => 
      item.id === draggedItem 
        ? { ...item, x: Math.max(0, Math.min(x, canvasSize.width)), y: Math.max(0, Math.min(y, canvasSize.height)) }
        : item
    );
    setItems(updatedItems);
    if (onItemsChange) onItemsChange(updatedItems);
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const handleRotate = (itemId) => {
    const updatedItems = items.map(item =>
      item.id === itemId
        ? { ...item, rotation: (item.rotation + 45) % 360 }
        : item
    );
    setItems(updatedItems);
    if (onItemsChange) onItemsChange(updatedItems);
  };

  const handleDelete = (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    if (onItemsChange) onItemsChange(updatedItems);
  };

  const scale = canvasSize.scale || 1;

  return (
    <div className="relative w-full h-screen bg-zinc-800 rounded-lg overflow-hidden">
      <div
        ref={canvasRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Room outline */}
        {canvasSize.width > 0 && (
          <div
            className="absolute border-2 border-zinc-600 bg-zinc-900/30"
            style={{
              left: canvasSize.offsetX,
              top: canvasSize.offsetY,
              width: canvasSize.width,
              height: canvasSize.height
            }}
          >
            {/* Room dimensions label */}
             <div className="absolute -top-6 left-0 text-zinc-400 text-xs">
               {canvasSize.isRotated ? `${formData.room_width}ft x ${formData.room_length}ft` : `${formData.room_length}ft x ${formData.room_width}ft`} {canvasSize.isRotated && '(rotated)'}
             </div>
          </div>
        )}

        {/* Items */}
        {items.map((item) => {
          const isRound = item.type.includes('round') || item.type === 'cocktail';
          const isVideoWall = item.type === 'videowall';
          
          let size;
          if (isRound) {
            size = item.diameter * scale;
          } else if (isVideoWall) {
            // Video walls have height and width in meters, need to convert to feet
            const heightInFt = item.width ? item.width * 3.28084 : 0;
            const widthInFt = item.length ? item.length * 3.28084 : 0;
            size = { length: widthInFt * scale, width: heightInFt * scale };
          } else {
            size = { length: (item.length || 0) * scale, width: (item.width || 0) * scale };
          }

          const displayName = item.name || item.type.replace('_', ' ').toUpperCase();

          return (
            <div
              key={item.id}
              className="absolute cursor-move hover:opacity-80 transition-opacity group"
              style={{
                left: canvasSize.offsetX + (item.x || 0),
                top: canvasSize.offsetY + (item.y || 0),
                width: isRound ? size : size.length,
                height: isRound ? size : size.width,
                transform: `rotate(${item.rotation || 0}deg)`,
                transformOrigin: 'center'
              }}
              onMouseDown={(e) => handleMouseDown(e, item)}
            >
              <div
                className="w-full h-full border-2 border-amber-500/50 flex items-center justify-center text-xs text-white font-semibold overflow-hidden"
                style={{
                  backgroundColor: item.color,
                  borderRadius: isRound ? '50%' : '4px'
                }}
              >
                <span className="truncate px-1">{displayName}</span>
              </div>
              
              {/* Control buttons */}
              <div className="absolute -top-7 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRotate(item.id);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  ↻
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-zinc-900/90 rounded-lg px-4 py-2 text-zinc-400 text-xs">
        <p>💡 Drag items to move • Click ↻ to rotate</p>
      </div>
    </div>
  );
}