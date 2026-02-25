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

  const addCustomItem = () => {
    setTentConfig(prev => ({
      ...prev,
      customEquipment: [...(prev.customEquipment || []), { name: 'Custom Item', width: 10, length: 10, color: '#9CA3AF' }]
    }));
  };

  const removeCustomItem = (idx) => {
    setTentConfig(prev => ({
      ...prev,
      customEquipment: prev.customEquipment.filter((_, i) => i !== idx)
    }));
  };

  const updateCustomItem = (idx, field, value) => {
    setTentConfig(prev => ({
      ...prev,
      customEquipment: prev.customEquipment.map((item, i) => 
        i === idx ? { ...item, [field]: field === 'color' || field === 'name' ? value : parseFloat(value) || 0 } : item
      )
    }));
  };


  const compactInput = "h-7 text-xs px-2";
  const compactColor = "w-8 h-7 rounded cursor-pointer border border-input";

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '200px' }}>
      {/* Sticky header */}
      <div className="px-3 py-2 border-b bg-white rounded-t-lg flex-shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Add Decor Items</h3>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-3 py-2 space-y-2">

        {/* Tables - all 3 in one compact card */}
        <div className="border rounded p-2 space-y-1">
          <Label className="text-xs font-semibold text-slate-600">Tables</Label>
          {[
            { label: '8ft', type: 'tables8ft' },
            { label: '6ft', type: 'tables6ft' },
            { label: '5ft Round', type: 'tables5ft' },
          ].map(({ label, type }) => (
            <div key={type} className="flex items-center gap-1">
              <span className="text-xs w-14 text-slate-500">{label}</span>
              <Input type="number" min="0" value={tentConfig[type].length}
                onChange={(e) => updateTableCount(type, e.target.value)}
                className={`flex-1 ${compactInput}`} />
              <input type="color" value={tentConfig[type][0]?.color || '#8B4513'}
                onChange={(e) => updateTableColor(type, e.target.value)}
                className={compactColor} />
            </div>
          ))}
        </div>

        {/* Cocktail Tables */}
        <div className="border rounded p-2">
          <div className="flex items-center gap-1">
            <span className="text-xs w-14 text-slate-500">Cocktail</span>
            <Input type="number" min="0" value={tentConfig.cocktailTables.length}
              onChange={(e) => updateTableCount('cocktailTables', e.target.value)}
              className={`flex-1 ${compactInput}`} />
            <input type="color" value={tentConfig.cocktailTables[0]?.color || '#8B4513'}
              onChange={(e) => updateTableColor('cocktailTables', e.target.value)}
              className={compactColor} />
          </div>
        </div>

        {/* Linen Color */}
        <div className="border rounded p-2 flex items-center gap-2">
          <Label className="text-xs font-semibold text-slate-600 flex-1">Linen Color</Label>
          <input type="color" value={tentConfig.linenColor}
            onChange={(e) => setTentConfig(prev => ({ ...prev, linenColor: e.target.value }))}
            className={compactColor} />
        </div>

        {/* Stages */}
        <div className="border rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-600">Stages</Label>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={addStage}><Plus className="w-3 h-3" /></Button>
          </div>
          {tentConfig.stages.map((stage, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 w-10">#{idx+1}</span>
              <Input type="number" placeholder="W" value={stage.width} onChange={(e) => updateStage(idx, 'width', e.target.value)} className={`flex-1 ${compactInput}`} />
              <Input type="number" placeholder="L" value={stage.length} onChange={(e) => updateStage(idx, 'length', e.target.value)} className={`flex-1 ${compactInput}`} />
              <Input type="number" placeholder="H" value={stage.height} onChange={(e) => updateStage(idx, 'height', e.target.value)} className={`flex-1 ${compactInput}`} />
              <input type="color" value={stage.color} onChange={(e) => updateStage(idx, 'color', e.target.value)} className={compactColor} />
              <button onClick={() => removeStage(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>

        {/* Video Walls */}
        <div className="border rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-600">Video Walls</Label>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={addVideoWall}><Plus className="w-3 h-3" /></Button>
          </div>
          {tentConfig.videoWalls.map((wall, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 w-10">#{idx+1}</span>
              <Input type="number" placeholder="L" value={wall.length} onChange={(e) => updateVideoWall(idx, 'length', e.target.value)} className={`flex-1 ${compactInput}`} />
              <Input type="number" placeholder="H" value={wall.height} onChange={(e) => updateVideoWall(idx, 'height', e.target.value)} className={`flex-1 ${compactInput}`} />
              <input type="color" value={wall.color || '#1E90FF'} onChange={(e) => updateVideoWall(idx, 'color', e.target.value)} className={compactColor} />
              <button onClick={() => removeVideoWall(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>

        {/* Dance Floors */}
        <div className="border rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-600">Dance Floors</Label>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={addDanceFloor}><Plus className="w-3 h-3" /></Button>
          </div>
          {tentConfig.danceFloors.map((floor, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 w-10">#{idx+1}</span>
              <Input type="number" placeholder="W" value={floor.width} onChange={(e) => updateDanceFloor(idx, 'width', e.target.value)} className={`flex-1 ${compactInput}`} />
              <Input type="number" placeholder="L" value={floor.length} onChange={(e) => updateDanceFloor(idx, 'length', e.target.value)} className={`flex-1 ${compactInput}`} />
              <input type="color" value={floor.color} onChange={(e) => updateDanceFloor(idx, 'color', e.target.value)} className={compactColor} />
              <button onClick={() => removeDanceFloor(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="border rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-600">Bars</Label>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={addBar}><Plus className="w-3 h-3" /></Button>
          </div>
          {tentConfig.bars.map((bar, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-xs text-slate-400 w-10">#{idx+1}</span>
              <Input type="number" placeholder="W" value={bar.width} onChange={(e) => updateBar(idx, 'width', e.target.value)} className={`flex-1 ${compactInput}`} />
              <Input type="number" placeholder="L" value={bar.length} onChange={(e) => updateBar(idx, 'length', e.target.value)} className={`flex-1 ${compactInput}`} />
              <input type="color" value={bar.color || '#654321'} onChange={(e) => updateBar(idx, 'color', e.target.value)} className={compactColor} />
              <button onClick={() => removeBar(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>

        {/* Custom Items */}
        <div className="border rounded p-2 space-y-1">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-600">Custom Items</Label>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={addCustomItem}><Plus className="w-3 h-3" /></Button>
          </div>
          {(tentConfig.customEquipment || []).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-1">
                <Input type="text" placeholder="Name" value={item.name} onChange={(e) => updateCustomItem(idx, 'name', e.target.value)} className={`flex-1 ${compactInput}`} />
                <button onClick={() => removeCustomItem(idx)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
              <div className="flex items-center gap-1 pl-1">
                <Input type="number" placeholder="W" value={item.width} onChange={(e) => updateCustomItem(idx, 'width', e.target.value)} className={`flex-1 ${compactInput}`} />
                <Input type="number" placeholder="L" value={item.length} onChange={(e) => updateCustomItem(idx, 'length', e.target.value)} className={`flex-1 ${compactInput}`} />
                <input type="color" value={item.color || '#9CA3AF'} onChange={(e) => updateCustomItem(idx, 'color', e.target.value)} className={compactColor} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}