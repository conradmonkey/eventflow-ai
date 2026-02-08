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
      videoWalls: [...prev.videoWalls, { length: 10, height: 8 }]
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
        i === idx ? { ...wall, [field]: parseFloat(value) || 0 } : wall
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

  const addTable8ft = () => {
    setTentConfig(prev => ({
      ...prev,
      tables8ft: [...prev.tables8ft, { color: '#8B4513' }]
    }));
  };

  const addTable6ft = () => {
    setTentConfig(prev => ({
      ...prev,
      tables6ft: [...prev.tables6ft, { color: '#8B4513' }]
    }));
  };

  const addTable5ft = () => {
    setTentConfig(prev => ({
      ...prev,
      tables5ft: [...prev.tables5ft, { color: '#8B4513' }]
    }));
  };

  const addBar = () => {
    setTentConfig(prev => ({
      ...prev,
      bars: [...prev.bars, { width: 8, length: 3 }]
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
        i === idx ? { ...bar, [field]: parseFloat(value) || 0 } : bar
      )
    }));
  };

  const addCocktailTable = () => {
    setTentConfig(prev => ({
      ...prev,
      cocktailTables: [...prev.cocktailTables, { color: '#000000' }]
    }));
  };



  return (
    <div className="space-y-4 max-h-[calc(100vh-500px)] overflow-y-auto">
      {/* Tent Dimensions */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <Label className="text-sm font-semibold">Tent Dimensions</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Length (ft)</Label>
            <Input
              type="number"
              value={tentConfig.length}
              onChange={(e) => setTentConfig(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label className="text-xs">Width (ft)</Label>
            <Input
              type="number"
              value={tentConfig.width}
              onChange={(e) => setTentConfig(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

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
            <div className="grid grid-cols-2 gap-2">
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
        <Button size="sm" variant="outline" className="w-full" onClick={addTable8ft}>
          Add 8ft Table
        </Button>
        <Button size="sm" variant="outline" className="w-full" onClick={addTable6ft}>
          Add 6ft Table
        </Button>
        <Button size="sm" variant="outline" className="w-full" onClick={addTable5ft}>
          Add 5ft Round Table
        </Button>
        <div className="text-xs text-gray-600">
          <p>8ft Tables: {tentConfig.tables8ft.length}</p>
          <p>6ft Tables: {tentConfig.tables6ft.length}</p>
          <p>5ft Round Tables: {tentConfig.tables5ft.length}</p>
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
            <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {/* Cocktail Tables */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Cocktail Tables</Label>
          <Button size="sm" variant="outline" onClick={addCocktailTable}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-600">Count: {tentConfig.cocktailTables.length}</p>
      </div>

      {/* Presentation Chairs */}
      {seatingArrangement === 'presentation' && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
          <Label className="text-sm font-semibold">Presentation Chairs</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Rows</Label>
              <Input
                type="number"
                value={tentConfig.chairs.rows}
                onChange={(e) => setTentConfig(prev => ({
                  ...prev,
                  chairs: { ...prev.chairs, rows: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div>
              <Label className="text-xs">Per Row</Label>
              <Input
                type="number"
                value={tentConfig.chairs.perRow}
                onChange={(e) => setTentConfig(prev => ({
                  ...prev,
                  chairs: { ...prev.chairs, perRow: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
          </div>
        </div>
      )}

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