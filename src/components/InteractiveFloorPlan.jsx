import { useState, useRef } from "react";
import { GripVertical, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function initializeElements(data) {
    const roomWidth = parseFloat(data.room_width || 100);
    const roomLength = parseFloat(data.room_length || 100);
    const elements = [];
    let yOffset = 20;

    // Stage
    if (data.stage_length && data.stage_width) {
      elements.push({
        id: 'stage',
        type: 'stage',
        x: 20,
        y: yOffset,
        width: parseFloat(data.stage_width),
        height: parseFloat(data.stage_length),
        rotation: 0,
        color: '#8b5cf6',
        label: 'Stage'
      });
      yOffset += parseFloat(data.stage_length) + 20;
    }

    // Video Wall
    if (data.video_wall_height && data.video_wall_width) {
      const wallWidthFt = parseFloat(data.video_wall_width) * 3.28084;
      const wallHeightFt = parseFloat(data.video_wall_height) * 3.28084;
      elements.push({
        id: 'videowall',
        type: 'videowall',
        x: 20,
        y: yOffset,
        width: wallWidthFt,
        height: wallHeightFt,
        rotation: 0,
        color: '#000000',
        label: 'Video Wall'
      });
      yOffset += wallHeightFt + 20;
    }

    // Dance Floor
    if (data.dance_floor_length && data.dance_floor_width) {
      elements.push({
        id: 'dancefloor',
        type: 'dancefloor',
        x: roomWidth / 2 - parseFloat(data.dance_floor_width) / 2,
        y: roomLength / 2 - parseFloat(data.dance_floor_length) / 2,
        width: parseFloat(data.dance_floor_width),
        height: parseFloat(data.dance_floor_length),
        rotation: 0,
        color: '#fbbf24',
        label: 'Dance Floor'
      });
    }

    // Bar
    if (data.bar_length && data.bar_width) {
      elements.push({
        id: 'bar',
        type: 'bar',
        x: roomWidth - parseFloat(data.bar_width) - 20,
        y: 20,
        width: parseFloat(data.bar_width),
        height: parseFloat(data.bar_length),
        rotation: 0,
        color: '#ef4444',
        label: 'Bar'
      });
    }

    // Tables
    let tableX = 30;
    let tableY = roomLength - 60;

    // 8ft Banquet Tables
    for (let i = 0; i < parseInt(data.table_8ft || 0); i++) {
      elements.push({
        id: `table-8ft-${i}`,
        type: 'table',
        x: tableX,
        y: tableY,
        width: 8,
        height: 2.5,
        rotation: 0,
        color: '#06b6d4',
        label: '8ft Table'
      });
      tableX += 12;
      if (tableX > roomWidth - 20) {
        tableX = 30;
        tableY -= 8;
      }
    }

    // 6ft Banquet Tables
    for (let i = 0; i < parseInt(data.table_6ft || 0); i++) {
      elements.push({
        id: `table-6ft-${i}`,
        type: 'table',
        x: tableX,
        y: tableY,
        width: 6,
        height: 2.5,
        rotation: 0,
        color: '#0ea5e9',
        label: '6ft Table'
      });
      tableX += 10;
      if (tableX > roomWidth - 20) {
        tableX = 30;
        tableY -= 8;
      }
    }

    // 5ft Round Tables
    for (let i = 0; i < parseInt(data.table_5ft_round || 0); i++) {
      elements.push({
        id: `table-5ft-round-${i}`,
        type: 'round',
        x: tableX,
        y: tableY,
        diameter: 5,
        rotation: 0,
        color: '#10b981',
        label: '5ft Round'
      });
      tableX += 8;
      if (tableX > roomWidth - 20) {
        tableX = 30;
        tableY -= 8;
      }
    }

    // 6ft Round Tables
    for (let i = 0; i < parseInt(data.table_6ft_round || 0); i++) {
      elements.push({
        id: `table-6ft-round-${i}`,
        type: 'round',
        x: tableX,
        y: tableY,
        diameter: 6,
        rotation: 0,
        color: '#14b8a6',
        label: '6ft Round'
      });
      tableX += 9;
      if (tableX > roomWidth - 20) {
        tableX = 30;
        tableY -= 8;
      }
    }

    // Cocktail Tables
    for (let i = 0; i < parseInt(data.cocktail_tables || 0); i++) {
      elements.push({
        id: `cocktail-${i}`,
        type: 'round',
        x: tableX,
        y: tableY,
        diameter: 2.5,
        rotation: 0,
        color: '#f59e0b',
        label: 'Cocktail'
      });
      tableX += 5;
      if (tableX > roomWidth - 20) {
        tableX = 30;
        tableY -= 6;
      }
    }

    return elements;
}

export default function InteractiveFloorPlan({ formData, onExport }) {
  const [elements, setElements] = useState(() => initializeElements(formData));
  const [selectedId, setSelectedId] = useState(null);
  const [dragState, setDragState] = useState(null);
  const containerRef = useRef(null);

  const SCALE = 4; // pixels per foot

  const handleMouseDown = (e, element) => {
    e.stopPropagation();
    setSelectedId(element.id);
    
    const rect = containerRef.current.getBoundingClientRect();
    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      elementStartX: element.x,
      elementStartY: element.y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;

    const deltaX = (e.clientX - dragState.startX) / SCALE;
    const deltaY = (e.clientY - dragState.startY) / SCALE;

    setElements(prev => prev.map(el => 
      el.id === dragState.elementId
        ? { ...el, x: dragState.elementStartX + deltaX, y: dragState.elementStartY + deltaY }
        : el
    ));
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const handleRotate = (elementId) => {
    setElements(prev => prev.map(el => 
      el.id === elementId
        ? { ...el, rotation: (el.rotation + 45) % 360 }
        : el
    ));
  };

  const roomWidth = parseFloat(formData.room_width || 100);
  const roomLength = parseFloat(formData.room_length || 100);

  return (
    <div className="flex justify-end">
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex gap-2 items-center justify-between">
        <p className="text-zinc-400 text-sm">Click and drag elements to reposition. Use rotate buttons to change orientation.</p>
        {selectedId && (
          <Button
            onClick={() => handleRotate(selectedId)}
            variant="outline"
            size="sm"
            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate Selected
          </Button>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative bg-zinc-100 rounded-lg overflow-auto"
        style={{ 
          width: '100%', 
          height: Math.min(roomLength * SCALE, 800),
          maxHeight: '800px'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Room outline */}
        <svg 
          width={roomWidth * SCALE} 
          height={roomLength * SCALE}
          className="absolute inset-0"
        >
          {/* Room Background */}
          <rect
            x={0}
            y={0}
            width={roomWidth * SCALE}
            height={roomLength * SCALE}
            fill="#fafafa"
            stroke="#374151"
            strokeWidth="4"
          />
          
          {/* Room Dimensions Label */}
          <text
            x={10}
            y={20}
            fill="#374151"
            fontSize="14"
            fontWeight="bold"
          >
            Room: {roomWidth}ft × {roomLength}ft
          </text>
          
          {/* Grid */}
          {Array.from({ length: Math.floor(roomWidth / 10) }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 10 * SCALE}
              y1={0}
              x2={(i + 1) * 10 * SCALE}
              y2={roomLength * SCALE}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: Math.floor(roomLength / 10) }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i + 1) * 10 * SCALE}
              x2={roomWidth * SCALE}
              y2={(i + 1) * 10 * SCALE}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Elements */}
          {elements.map(element => {
            const isSelected = element.id === selectedId;
            
            if (element.type === 'round') {
              const radius = element.diameter / 2;
              return (
                <g key={element.id}>
                  <circle
                    cx={(element.x + radius) * SCALE}
                    cy={(element.y + radius) * SCALE}
                    r={radius * SCALE}
                    fill={element.color}
                    fillOpacity={0.7}
                    stroke={isSelected ? '#fbbf24' : '#374151'}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{ cursor: 'move' }}
                    onMouseDown={(e) => handleMouseDown(e, element)}
                  />
                  <text
                    x={(element.x + radius) * SCALE}
                    y={(element.y + radius) * SCALE}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {element.diameter}ft
                  </text>
                </g>
              );
            }

            return (
              <g 
                key={element.id}
                transform={`rotate(${element.rotation} ${(element.x + element.width / 2) * SCALE} ${(element.y + element.height / 2) * SCALE})`}
              >
                <rect
                  x={element.x * SCALE}
                  y={element.y * SCALE}
                  width={element.width * SCALE}
                  height={element.height * SCALE}
                  fill={element.color}
                  fillOpacity={0.7}
                  stroke={isSelected ? '#fbbf24' : '#374151'}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ cursor: 'move' }}
                  onMouseDown={(e) => handleMouseDown(e, element)}
                />
                <text
                  x={(element.x + element.width / 2) * SCALE}
                  y={(element.y + element.height / 2) * SCALE}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {element.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {elements.filter((el, idx, self) => self.findIndex(e => e.type === el.type) === idx).map(el => (
          <div key={el.type} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: el.color }}
            />
            <span className="text-zinc-400">{el.label}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}