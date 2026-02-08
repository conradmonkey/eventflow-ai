import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function TentInputPanel({ tentConfig, setTentConfig, seatingArrangement, attendees }) {
  const addStage = () => {
    setTentConfig(prev => ({
      ...prev,
      stages: [...prev.stages, { width: 20, length: 20, height: 4, color: '#8B4513' }]
    }));
  };

  const removeStage = (idx) => {
    setTentConfig(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== idx)
    }));
  };

  const updateStage = (idx, field, value) => {
    setTentConfig(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === idx ? { ...stage, [field]: field === 'color' ? value : parseFloat(value) || 0 } : stage
      )
    }));
  };

  const addVideoWall = () => {
    setTentConfig(prev => ({
      ...prev,
      videoWalls: [...prev.videoWalls, { length: 10, height: 8, color: '#1E90FF' }]
    }));
  };

  const removeVideoWall = (idx) => {
    setTentConfig(prev => ({
      ...prev,
      videoWalls: prev.videoWalls.filter((_, i) => i !== idx)
    }));
  };

  const updateVideoWall = (idx, field, value) => {
    setTentConfig(prev => ({
      ...prev,
      videoWalls: prev.videoWalls.map((wall, i) => 
        i === idx ? { ...wall, [field]: field === 'color' ? value : parseFloat(value) || 0 } : wall
      )
    }));
  };

  const addDanceFloor = () => {
    setTentConfig(prev => ({
      ...prev,
      danceFloors: [...prev.danceFloors, { width: 20, length: 20, color: '#D4AF37' }]
    }));
  };

  const removeDanceFloor = (idx) => {
    setTentConfig(prev => ({
      ...prev,
      danceFloors: prev.danceFloors.filter((_, i) => i !== idx)
    }));
  };

  const updateDanceFloor = (idx, field, value) => {
    setTentConfig(prev => ({
      ...prev,
      danceFloors: prev.danceFloors.map((floor, i) => 
        i === idx ? { ...floor, [field]: field === 'color' ? value : parseFloat(value) || 0 } : floor
      )
    }));
  };

  const updateTableCount = (tableType, count) => {
    const numCount = Math.max(0, parseInt(count) || 0);
    setTentConfig(prev => {
      const currentCount = prev[tableType].length;
      const newConfig = { ...prev };
      
      if (numCount > currentCount) {
        const toAdd = numCount - currentCount;
        newConfig[tableType] = [...prev[tableType], ...Array(toAdd).fill({ color: '#8B4513' })];
      } else if (numCount < currentCount) {
        newConfig[tableType] = prev[tableType].slice(0, numCount);
      }
      
      return newConfig;
    });
  };

  const updateTableColor = (tableType, color) => {
    setTentConfig(prev => ({
      ...prev,
      [tableType]: prev[tableType].map(table => ({ ...table, color }))
    }));
  };

  const addBar = () => {
    setTentConfig(prev => ({
      ...prev,
      bars: [...prev.bars, { width: 8, length: 3, color: '#654321' }]
    }));
  };

  const removeBar = (idx) => {
    setTentConfig(prev => ({
      ...prev,
      bars: prev.bars.filter((_, i) => i !== idx)
    }));
  };

  const updateBar = (idx, field, value) => {
    setTentConfig(prev => ({
      ...prev,
      bars: prev.bars.map((bar, i) => 
        i === idx ? { ...bar, [field]: field === 'color' ? value : parseFloat(value) || 0 } : bar
      )
    }));
  };





  return (
    <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-900">Add Decor Items</h3>
      
      {/* Stages */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Stages</Label>
          <Button size="sm" variant="outline" onClick={addStage}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tentConfig.stages.map((stage, idx) => (
          <div key={idx} className="border rounded p-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Stage {idx + 1}</span>
              <button onClick={() => removeStage(idx)} className="text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Width"
                value={stage.width}
                onChange={(e) => updateStage(idx, 'width', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Length"
                value={stage.length}
                onChange={(e) => updateStage(idx, 'length', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Height"
                value={stage.height}
                onChange={(e) => updateStage(idx, 'height', e.target.value)}
              />
            </div>
            <Input
              type="color"
              value={stage.color}
              onChange={(e) => updateStage(idx, 'color', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Video Walls */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Video Walls</Label>
          <Button size="sm" variant="outline" onClick={addVideoWall}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tentConfig.videoWalls.map((wall, idx) => (
          <div key={idx} className="border rounded p-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Wall {idx + 1}</span>
              <button onClick={() => removeVideoWall(idx)} className="text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <Input 
                type="number" 
                placeholder="Length" 
                value={wall.length}
                onChange={(e) => updateVideoWall(idx, 'length', e.target.value)}
              />
              <Input 
                type="number" 
                placeholder="Height" 
                value={wall.height}
                onChange={(e) => updateVideoWall(idx, 'height', e.target.value)}
              />
              <input
                type="color"
                value={wall.color || '#1E90FF'}
                onChange={(e) => updateVideoWall(idx, 'color', e.target.value)}
                className="w-full h-9 rounded cursor-pointer border border-input"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dance Floors */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Dance Floors</Label>
          <Button size="sm" variant="outline" onClick={addDanceFloor}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tentConfig.danceFloors.map((floor, idx) => (
          <div key={idx} className="border rounded p-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Floor {idx + 1}</span>
              <button onClick={() => removeDanceFloor(idx)} className="text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input 
                type="number" 
                placeholder="Width" 
                value={floor.width}
                onChange={(e) => updateDanceFloor(idx, 'width', e.target.value)}
              />
              <Input 
                type="number" 
                placeholder="Length" 
                value={floor.length}
                onChange={(e) => updateDanceFloor(idx, 'length', e.target.value)}
              />
            </div>
            <Input 
              type="color" 
              value={floor.color}
              onChange={(e) => updateDanceFloor(idx, 'color', e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <Label className="text-sm font-semibold">Tables</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs">8ft</Label>
              <Input
                type="number"
                min="0"
                value={tentConfig.tables8ft.length}
                onChange={(e) => updateTableCount('tables8ft', e.target.value)}
                className="w-full"
              />
            </div>
            <input
              type="color"
              value={tentConfig.tables8ft[0]?.color || '#8B4513'}
              onChange={(e) => updateTableColor('tables8ft', e.target.value)}
              className="w-12 h-9 rounded cursor-pointer border border-input mt-5"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs">6ft</Label>
              <Input
                type="number"
                min="0"
                value={tentConfig.tables6ft.length}
                onChange={(e) => updateTableCount('tables6ft', e.target.value)}
                className="w-full"
              />
            </div>
            <input
              type="color"
              value={tentConfig.tables6ft[0]?.color || '#8B4513'}
              onChange={(e) => updateTableColor('tables6ft', e.target.value)}
              className="w-12 h-9 rounded cursor-pointer border border-input mt-5"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs">5ft Round</Label>
              <Input
                type="number"
                min="0"
                value={tentConfig.tables5ft.length}
                onChange={(e) => updateTableCount('tables5ft', e.target.value)}
                className="w-full"
              />
            </div>
            <input
              type="color"
              value={tentConfig.tables5ft[0]?.color || '#8B4513'}
              onChange={(e) => updateTableColor('tables5ft', e.target.value)}
              className="w-12 h-9 rounded cursor-pointer border border-input mt-5"
            />
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Bars</Label>
          <Button size="sm" variant="outline" onClick={addBar}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tentConfig.bars.map((bar, idx) => (
          <div key={idx} className="border rounded p-2 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Bar {idx + 1}</span>
              <button onClick={() => removeBar(idx)} className="text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <Input 
                type="number" 
                placeholder="Width" 
                value={bar.width}
                onChange={(e) => updateBar(idx, 'width', e.target.value)}
              />
              <Input 
                type="number" 
                placeholder="Length" 
                value={bar.length}
                onChange={(e) => updateBar(idx, 'length', e.target.value)}
              />
              <input
                type="color"
                value={bar.color || '#654321'}
                onChange={(e) => updateBar(idx, 'color', e.target.value)}
                className="w-full h-9 rounded cursor-pointer border border-input"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cocktail Tables */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label className="text-sm font-semibold">Cocktail</Label>
            <Input
              type="number"
              min="0"
              value={tentConfig.cocktailTables.length}
              onChange={(e) => updateTableCount('cocktailTables', e.target.value)}
              className="w-full"
            />
          </div>
          <input
            type="color"
            value={tentConfig.cocktailTables[0]?.color || '#8B4513'}
            onChange={(e) => updateTableColor('cocktailTables', e.target.value)}
            className="w-12 h-9 rounded cursor-pointer border border-input mt-5"
          />
        </div>
      </div>

      {/* Linen Color */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <Label className="text-sm font-semibold">Linen Color</Label>
        <Input
          type="color"
          value={tentConfig.linenColor}
          onChange={(e) => setTentConfig(prev => ({ ...prev, linenColor: e.target.value }))}
        />
      </div>
    </div>
  );
}