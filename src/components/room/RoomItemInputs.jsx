import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RoomItemInputs({ onAddItems }) {
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

  const ci = "h-7 text-xs bg-zinc-900 border-zinc-700 text-white"; // compact input

  const CompactDynamic = ({ label, items, onAdd, onRemove, onUpdate, fields }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-amber-400">{label}</span>
        <button onClick={onAdd} className="text-xs text-amber-400 hover:text-amber-300 px-1">+ Add</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1 bg-zinc-800/50 rounded px-2 py-1">
          {fields.map(f => (
            f.type === 'text'
              ? <Input key={f.key} type="text" value={item[f.key]} placeholder={f.placeholder} onChange={(e) => onUpdate(idx, f.key, e.target.value)} className={`flex-1 ${ci}`} />
              : f.type === 'color'
              ? <input key={f.key} type="color" value={item[f.key]} onChange={(e) => onUpdate(idx, f.key, e.target.value)} className="w-7 h-7 rounded border border-zinc-700 cursor-pointer" />
              : <Input key={f.key} type="number" value={item[f.key]} placeholder={f.label} min={f.min || 1} step={f.step || 1} onChange={(e) => onUpdate(idx, f.key, e.target.value)} className={`w-14 ${ci}`} />
          ))}
          <button onClick={() => onRemove(idx)} className="text-red-400 text-xs ml-1">✕</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
      {/* Sticky header */}
      <div className="px-4 pt-3 pb-2 border-b border-zinc-800 flex-shrink-0">
        <h3 className="font-semibold text-sm text-white">Add Items</h3>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-3 py-2 space-y-3">

        {/* Tables */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-amber-400">Tables</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {[
              { key: 'table_8ft', label: '8ft Banquet' },
              { key: 'table_6ft', label: '6ft Banquet' },
              { key: 'table_5ft_round', label: '5ft Round' },
              { key: 'table_6ft_round', label: '6ft Round' },
              { key: 'cocktail_tables', label: 'Cocktail' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-xs text-zinc-400 w-20 shrink-0">{label}</span>
                <Input type="number" min="0" value={tables[key]} onChange={(e) => handleTableChange(key, e.target.value)} className={`w-14 ${ci}`} />
              </div>
            ))}
            <div className="flex items-center gap-1 col-span-2">
              <span className="text-xs text-zinc-400 w-20 shrink-0">Drape</span>
              <Select value={tableColor} onValueChange={setTableColor}>
                <SelectTrigger className="h-7 text-xs bg-zinc-900 border-zinc-700 text-white flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {['white','black','ivory','champagne','gold','silver','navy','burgundy'].map(c => (
                    <SelectItem key={c} value={c} className="text-white capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <CompactDynamic label="Stages (ft)" items={stages} onAdd={addStage} onRemove={removeStage} onUpdate={updateStage}
          fields={[{ key: 'length', label: 'L' }, { key: 'width', label: 'W' }]} />

        <CompactDynamic label="Dance Floors (ft)" items={danceFloors} onAdd={addDanceFloor} onRemove={removeDanceFloor} onUpdate={updateDanceFloor}
          fields={[{ key: 'length', label: 'L' }, { key: 'width', label: 'W' }]} />

        <CompactDynamic label="Bars (ft)" items={bars} onAdd={addBar} onRemove={removeBar} onUpdate={updateBar}
          fields={[{ key: 'length', label: 'L' }, { key: 'width', label: 'W' }]} />

        <CompactDynamic label="Video Walls (m)" items={videoWalls} onAdd={addVideoWall} onRemove={removeVideoWall} onUpdate={updateVideoWall}
          fields={[{ key: 'height', label: 'H', min: 0.5, step: 0.5 }, { key: 'width', label: 'W', min: 0.5, step: 0.5 }]} />

        <CompactDynamic label="Custom Items (ft)" items={customItems} onAdd={addCustomItem} onRemove={removeCustomItem} onUpdate={updateCustomItem}
          fields={[{ key: 'name', label: 'Name', type: 'text', placeholder: 'Name' }, { key: 'length', label: 'L' }, { key: 'width', label: 'W' }, { key: 'color', type: 'color' }]} />

      </div>

      <div className="px-3 py-2 border-t border-zinc-800 flex-shrink-0">
        <Button onClick={handleAddItems} className="w-full h-8 text-xs bg-amber-500 hover:bg-amber-600 text-black font-semibold">
          Add Items to Layout
        </Button>
      </div>
    </div>
  );
}