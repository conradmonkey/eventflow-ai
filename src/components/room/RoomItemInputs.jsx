import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RoomItemInputs({ onAddItems, onAfterAdd }) {
  const [stages, setStages] = useState([]);
  const [danceFloors, setDanceFloors] = useState([]);
  const [bars, setBars] = useState([]);
  const [videoWalls, setVideoWalls] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [tables, setTables] = useState({
    table_8ft: 0,
    table_6ft: 0,
    table_5ft_round: 0,
    table_6ft_round: 0,
    cocktail_tables: 0,
  });
  const [tableColor, setTableColor] = useState('white');

  const addStage = () => {
    setStages([...stages, { length: 20, width: 16 }]);
  };

  const updateStage = (index, field, value) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setStages(updated);
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const addDanceFloor = () => {
    setDanceFloors([...danceFloors, { length: 20, width: 20 }]);
  };

  const updateDanceFloor = (index, field, value) => {
    const updated = [...danceFloors];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setDanceFloors(updated);
  };

  const removeDanceFloor = (index) => {
    setDanceFloors(danceFloors.filter((_, i) => i !== index));
  };

  const addBar = () => {
    setBars([...bars, { length: 12, width: 4 }]);
  };

  const updateBar = (index, field, value) => {
    const updated = [...bars];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setBars(updated);
  };

  const removeBar = (index) => {
    setBars(bars.filter((_, i) => i !== index));
  };

  const addVideoWall = () => {
    setVideoWalls([...videoWalls, { height: 3, width: 5 }]);
  };

  const updateVideoWall = (index, field, value) => {
    const updated = [...videoWalls];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setVideoWalls(updated);
  };

  const removeVideoWall = (index) => {
    setVideoWalls(videoWalls.filter((_, i) => i !== index));
  };

  const addCustomItem = () => {
    setCustomItems([...customItems, { name: '', length: 10, width: 10, color: '#808080' }]);
  };

  const updateCustomItem = (index, field, value) => {
    const updated = [...customItems];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' || field === 'color' ? value : parseFloat(value) || 0
    };
    setCustomItems(updated);
  };

  const removeCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const handleTableChange = (type, value) => {
    setTables(prev => ({ ...prev, [type]: Math.max(0, parseInt(value) || 0) }));
  };

  const handleAddItems = () => {
    const newItems = [];

    // Add stages
    stages.forEach(stage => {
      newItems.push({
        type: 'stage',
        length: stage.length,
        width: stage.width,
        color: '#8B4513'
      });
    });

    // Add dance floors
    danceFloors.forEach(df => {
      newItems.push({
        type: 'dancefloor',
        length: df.length,
        width: df.width,
        color: '#2C2C2C'
      });
    });

    // Add bars
    bars.forEach(bar => {
      newItems.push({
        type: 'bar',
        length: bar.length,
        width: bar.width,
        color: '#654321'
      });
    });

    // Add video walls
    videoWalls.forEach(vw => {
      newItems.push({
        type: 'videowall',
        height: vw.height,
        width: vw.width,
        color: '#000000'
      });
    });

    // Add custom items
    customItems.forEach(item => {
      if (item.name.trim()) {
        newItems.push({
          type: 'custom',
          name: item.name,
          length: item.length,
          width: item.width,
          color: item.color
        });
      }
    });

    // Add tables
    for (let i = 0; i < tables.table_8ft; i++) {
      newItems.push({
        type: 'table_8ft',
        length: 8,
        width: 2.5,
        color: '#D4AF37'
      });
    }

    for (let i = 0; i < tables.table_6ft; i++) {
      newItems.push({
        type: 'table_6ft',
        length: 6,
        width: 2.5,
        color: '#D4AF37'
      });
    }

    for (let i = 0; i < tables.table_5ft_round; i++) {
      newItems.push({
        type: 'table_5ft_round',
        diameter: 5,
        color: '#FFD700'
      });
    }

    for (let i = 0; i < tables.table_6ft_round; i++) {
      newItems.push({
        type: 'table_6ft_round',
        diameter: 6,
        color: '#FFD700'
      });
    }

    for (let i = 0; i < tables.cocktail_tables; i++) {
      newItems.push({
        type: 'cocktail',
        diameter: 2.5,
        color: '#C0C0C0'
      });
    }

    onAddItems(newItems, tableColor);
    if (onAfterAdd) onAfterAdd();

    // Clear all inputs
    setStages([]);
    setDanceFloors([]);
    setBars([]);
    setVideoWalls([]);
    setCustomItems([]);
    setTables({
      table_8ft: 0,
      table_6ft: 0,
      table_5ft_round: 0,
      table_6ft_round: 0,
      cocktail_tables: 0,
    });
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 space-y-3 max-h-[600px] overflow-y-auto">
      <h3 className="font-semibold text-sm text-white mb-2">Add Items</h3>

      {/* Stages */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Stages (feet)</h4>
        <Button onClick={addStage} variant="outline" className="w-full h-8 text-xs border-zinc-700 text-zinc-300">
          + Add Stage
        </Button>
        {stages.map((stage, idx) => (
          <div key={idx} className="border border-zinc-700 rounded p-2 space-y-2 bg-zinc-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white">Stage {idx + 1}</span>
              <button onClick={() => removeStage(idx)} className="text-red-400 text-xs hover:text-red-500">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-zinc-400">Length (ft)</Label>
                <Input type="number" value={stage.length} onChange={(e) => updateStage(idx, 'length', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Width (ft)</Label>
                <Input type="number" value={stage.width} onChange={(e) => updateStage(idx, 'width', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dance Floors */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Dance Floors (feet)</h4>
        <Button onClick={addDanceFloor} variant="outline" className="w-full h-8 text-xs border-zinc-700 text-zinc-300">
          + Add Dance Floor
        </Button>
        {danceFloors.map((df, idx) => (
          <div key={idx} className="border border-zinc-700 rounded p-2 space-y-2 bg-zinc-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white">Dance Floor {idx + 1}</span>
              <button onClick={() => removeDanceFloor(idx)} className="text-red-400 text-xs hover:text-red-500">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-zinc-400">Length (ft)</Label>
                <Input type="number" value={df.length} onChange={(e) => updateDanceFloor(idx, 'length', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Width (ft)</Label>
                <Input type="number" value={df.width} onChange={(e) => updateDanceFloor(idx, 'width', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Bars (feet)</h4>
        <Button onClick={addBar} variant="outline" className="w-full h-8 text-xs border-zinc-700 text-zinc-300">
          + Add Bar
        </Button>
        {bars.map((bar, idx) => (
          <div key={idx} className="border border-zinc-700 rounded p-2 space-y-2 bg-zinc-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white">Bar {idx + 1}</span>
              <button onClick={() => removeBar(idx)} className="text-red-400 text-xs hover:text-red-500">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-zinc-400">Length (ft)</Label>
                <Input type="number" value={bar.length} onChange={(e) => updateBar(idx, 'length', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Width (ft)</Label>
                <Input type="number" value={bar.width} onChange={(e) => updateBar(idx, 'width', e.target.value)} min="1" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Walls */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Video Walls (metres)</h4>
        <Button onClick={addVideoWall} variant="outline" className="w-full h-8 text-xs border-zinc-700 text-zinc-300">
          + Add Video Wall
        </Button>
        {videoWalls.map((vw, idx) => (
          <div key={idx} className="border border-zinc-700 rounded p-2 space-y-2 bg-zinc-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white">Video Wall {idx + 1}</span>
              <button onClick={() => removeVideoWall(idx)} className="text-red-400 text-xs hover:text-red-500">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-zinc-400">Height (m)</Label>
                <Input type="number" value={vw.height} onChange={(e) => updateVideoWall(idx, 'height', e.target.value)} min="0.5" step="0.5" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Width (m)</Label>
                <Input type="number" value={vw.width} onChange={(e) => updateVideoWall(idx, 'width', e.target.value)} min="0.5" step="0.5" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Items */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Custom Items (feet)</h4>
        <Button onClick={addCustomItem} variant="outline" className="w-full h-8 text-xs border-zinc-700 text-zinc-300">
          + Add Custom Item
        </Button>
        {customItems.map((item, idx) => (
          <div key={idx} className="border border-zinc-700 rounded p-2 space-y-2 bg-zinc-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-white">Custom Item {idx + 1}</span>
              <button onClick={() => removeCustomItem(idx)} className="text-red-400 text-xs hover:text-red-500">Remove</button>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Name</Label>
              <Input type="text" value={item.name} onChange={(e) => updateCustomItem(idx, 'name', e.target.value)} placeholder="e.g., Statue" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-zinc-400">Length (ft)</Label>
                <Input type="number" value={item.length} onChange={(e) => updateCustomItem(idx, 'length', e.target.value)} min="1" step="0.5" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Width (ft)</Label>
                <Input type="number" value={item.width} onChange={(e) => updateCustomItem(idx, 'width', e.target.value)} min="1" step="0.5" className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Color</Label>
              <input type="color" value={item.color} onChange={(e) => updateCustomItem(idx, 'color', e.target.value)} className="h-7 w-full rounded border border-zinc-700 bg-zinc-900" />
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-amber-400">Tables</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-zinc-400">8ft Banquet</Label>
            <Input type="number" min="0" value={tables.table_8ft} onChange={(e) => handleTableChange('table_8ft', e.target.value)} className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">6ft Banquet</Label>
            <Input type="number" min="0" value={tables.table_6ft} onChange={(e) => handleTableChange('table_6ft', e.target.value)} className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">5ft Round</Label>
            <Input type="number" min="0" value={tables.table_5ft_round} onChange={(e) => handleTableChange('table_5ft_round', e.target.value)} className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">6ft Round</Label>
            <Input type="number" min="0" value={tables.table_6ft_round} onChange={(e) => handleTableChange('table_6ft_round', e.target.value)} className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Cocktail</Label>
            <Input type="number" min="0" value={tables.cocktail_tables} onChange={(e) => handleTableChange('cocktail_tables', e.target.value)} className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white" />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Drape Color</Label>
            <Select value={tableColor} onValueChange={setTableColor}>
              <SelectTrigger className="h-8 text-xs bg-zinc-900 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="white" className="text-white">White</SelectItem>
                <SelectItem value="black" className="text-white">Black</SelectItem>
                <SelectItem value="ivory" className="text-white">Ivory</SelectItem>
                <SelectItem value="champagne" className="text-white">Champagne</SelectItem>
                <SelectItem value="gold" className="text-white">Gold</SelectItem>
                <SelectItem value="silver" className="text-white">Silver</SelectItem>
                <SelectItem value="navy" className="text-white">Navy</SelectItem>
                <SelectItem value="burgundy" className="text-white">Burgundy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={handleAddItems} className="w-full h-10 text-sm bg-amber-500 hover:bg-amber-600 text-black font-semibold">
        Add Items to Layout
      </Button>
    </div>
  );
}