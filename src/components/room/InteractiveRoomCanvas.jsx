import { useState, useRef, useEffect } from "react";

export default function InteractiveRoomCanvas({ formData }) {
  const canvasRef = useRef(null);
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Calculate scale and setup items when formData changes
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

    // Create items array
    const newItems = [];
    let itemId = 0;
    const actualRoomLength = isRotated ? roomWidth : roomLength;
    const actualRoomWidth = isRotated ? roomLength : roomWidth;

    // Add stage
    if (formData.stage_length && formData.stage_width) {
      const stageLength = isRotated ? parseFloat(formData.stage_width) : parseFloat(formData.stage_length);
      const stageWidth = isRotated ? parseFloat(formData.stage_length) : parseFloat(formData.stage_width);
      newItems.push({
        id: `stage-${itemId++}`,
        type: 'stage',
        length: stageLength,
        width: stageWidth,
        x: padding + 50,
        y: padding + 50,
        rotation: 0,
        color: '#8B4513'
      });
    }

    // Add dance floor
    if (formData.dance_floor_length && formData.dance_floor_width) {
      const dfLength = isRotated ? parseFloat(formData.dance_floor_width) : parseFloat(formData.dance_floor_length);
      const dfWidth = isRotated ? parseFloat(formData.dance_floor_length) : parseFloat(formData.dance_floor_width);
      newItems.push({
        id: `dancefloor-${itemId++}`,
        type: 'dancefloor',
        length: dfLength,
        width: dfWidth,
        x: scaledRoomLength / 2,
        y: scaledRoomWidth / 2,
        rotation: 0,
        color: '#2C2C2C'
      });
    }

    // Add bar
    if (formData.bar_length && formData.bar_width) {
      const barLength = isRotated ? parseFloat(formData.bar_width) : parseFloat(formData.bar_length);
      const barWidth = isRotated ? parseFloat(formData.bar_length) : parseFloat(formData.bar_width);
      newItems.push({
        id: `bar-${itemId++}`,
        type: 'bar',
        length: barLength,
        width: barWidth,
        x: scaledRoomLength - padding - 100,
        y: padding + 50,
        rotation: 0,
        color: '#654321'
      });
    }

    // Add video wall
    if (formData.video_wall_height && formData.video_wall_width) {
      const videoWallLength = parseFloat(formData.video_wall_width) * 3.28084; // m to ft
      const videoWallHeight = parseFloat(formData.video_wall_height) * 3.28084;
      const vwLength = isRotated ? videoWallHeight : videoWallLength;
      const vwWidth = isRotated ? videoWallLength : videoWallHeight;
      newItems.push({
        id: `videowall-${itemId++}`,
        type: 'videowall',
        length: vwLength,
        width: vwWidth,
        x: padding + 50,
        y: scaledRoomWidth - padding - 50,
        rotation: 0,
        color: '#000000'
      });
    }

    // Add tables - 8ft banquet
    const table8ftCount = parseInt(formData.table_8ft || 0);
    for (let i = 0; i < table8ftCount; i++) {
      newItems.push({
        id: `table8ft-${itemId++}`,
        type: 'table_8ft',
        length: 8,
        width: 2.5,
        x: 150 + (i % 5) * 60,
        y: 200 + Math.floor(i / 5) * 40,
        rotation: 0,
        color: '#D4AF37'
      });
    }

    // Add tables - 6ft banquet
    const table6ftBanquetCount = parseInt(formData.table_6ft || 0);
    for (let i = 0; i < table6ftBanquetCount; i++) {
      newItems.push({
        id: `table6ft-${itemId++}`,
        type: 'table_6ft',
        length: 6,
        width: 2.5,
        x: 150 + (i % 5) * 50,
        y: 300 + Math.floor(i / 5) * 40,
        rotation: 0,
        color: '#D4AF37'
      });
    }

    // Add tables - 5ft round
    const table5ftRoundCount = parseInt(formData.table_5ft_round || 0);
    for (let i = 0; i < table5ftRoundCount; i++) {
      newItems.push({
        id: `table5ft-${itemId++}`,
        type: 'table_5ft_round',
        diameter: 5,
        x: 200 + (i % 4) * 70,
        y: 400 + Math.floor(i / 4) * 70,
        rotation: 0,
        color: '#FFD700'
      });
    }

    // Add tables - 6ft round
    const table6ftRoundCount = parseInt(formData.table_6ft_round || 0);
    for (let i = 0; i < table6ftRoundCount; i++) {
      newItems.push({
        id: `table6ftround-${itemId++}`,
        type: 'table_6ft_round',
        diameter: 6,
        x: 200 + (i % 4) * 80,
        y: 500 + Math.floor(i / 4) * 80,
        rotation: 0,
        color: '#FFD700'
      });
    }

    // Add cocktail tables
    const cocktailCount = parseInt(formData.cocktail_tables || 0);
    for (let i = 0; i < cocktailCount; i++) {
      newItems.push({
        id: `cocktail-${itemId++}`,
        type: 'cocktail',
        diameter: 2.5,
        x: 100 + (i % 6) * 50,
        y: 100 + Math.floor(i / 6) * 50,
        rotation: 0,
        color: '#C0C0C0'
      });
    }

    setItems(newItems);
  }, [formData]);

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
    
    setItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: Math.max(0, Math.min(x, canvasSize.width)), y: Math.max(0, Math.min(y, canvasSize.height)) }
        : item
    ));
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
  };

  const handleRotate = (itemId) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, rotation: (item.rotation + 45) % 360 }
        : item
    ));
  };

  const scale = canvasSize.scale || 1;

  return (
    <div className="relative w-full h-[600px] bg-zinc-800 rounded-lg overflow-hidden">
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
              {formData.room_length}ft x {formData.room_width}ft
            </div>
          </div>
        )}

        {/* Items */}
        {items.map((item) => {
          const isRound = item.type.includes('round') || item.type === 'cocktail';
          const size = isRound 
            ? item.diameter * scale 
            : { length: item.length * scale, width: item.width * scale };

          return (
            <div
              key={item.id}
              className="absolute cursor-move hover:opacity-80 transition-opacity group"
              style={{
                left: canvasSize.offsetX + item.x,
                top: canvasSize.offsetY + item.y,
                width: isRound ? size : size.length,
                height: isRound ? size : size.width,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: 'center'
              }}
              onMouseDown={(e) => handleMouseDown(e, item)}
            >
              <div
                className="w-full h-full border-2 border-amber-500/50 flex items-center justify-center text-xs text-white font-semibold"
                style={{
                  backgroundColor: item.color,
                  borderRadius: isRound ? '50%' : '4px'
                }}
              >
                {item.type.replace('_', ' ').toUpperCase()}
              </div>
              
              {/* Rotate button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRotate(item.id);
                }}
                className="absolute -top-6 -right-6 bg-amber-500 hover:bg-amber-600 text-black rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              >
                ↻
              </button>
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