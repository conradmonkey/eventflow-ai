import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suggestTentCombination } from './TentSizingCalculator';

export default function LayoutInputs({ onAddItems }) {
  const [inputs, setInputs] = useState({
    tent_8x8: 0,
    tent_10x10: 0,
    tent_10x20: 0,
    tent_15x15: 0,
    tent_20x20: 0,
    tent_20x30: 0,
    tent_30x30: 0,
    frame_tent: { count: 0, width: 20, length: 30 },
    toilet: 0,
    handwash: 0,
    sink: 0,
    stage: { count: 0, width: 16, length: 20 },
  });

  const [previousInputs, setPreviousInputs] = useState({
    tent_8x8: 0,
    tent_10x10: 0,
    tent_10x20: 0,
    tent_15x15: 0,
    tent_20x20: 0,
    tent_20x30: 0,
    tent_30x30: 0,
    frame_tent: { count: 0, width: 20, length: 30 },
    toilet: 0,
    handwash: 0,
    sink: 0,
    stage: { count: 0, width: 16, length: 20 },
  });

  const [videoWalls, setVideoWalls] = useState([]);
  const [customItems, setCustomItems] = useState([]);
  const [stages, setStages] = useState([]);
  const [attendees, setAttendees] = useState('');
  const [seatingArrangement, setSeatingArrangement] = useState('seated_dinner');
  const [suggestedTent, setSuggestedTent] = useState(null);

  useEffect(() => {
    if (attendees && seatingArrangement) {
      const suggestion = suggestTentCombination(parseInt(attendees), seatingArrangement);
      setSuggestedTent(suggestion);
    } else {
      setSuggestedTent(null);
    }
  }, [attendees, seatingArrangement]);

  const handleTentChange = (tentType, value) => {
    setInputs(prev => ({
      ...prev,
      [tentType]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const applySuggestedTent = () => {
    if (!suggestedTent) return;
    const tentType = suggestedTent.recommended.type;
    setInputs(prev => ({
      ...prev,
      [tentType]: (prev[tentType] || 0) + 1
    }));
  };

  const addVideoWall = () => {
    setVideoWalls([...videoWalls, { length: 10, height: 8, color: '#000000' }]);
  };

  const updateVideoWall = (index, field, value) => {
    const updated = [...videoWalls];
    updated[index] = {
      ...updated[index],
      [field]: field === 'color' ? value : parseFloat(value) || 0
    };
    setVideoWalls(updated);
  };

  const removeVideoWall = (index) => {
    setVideoWalls(videoWalls.filter((_, i) => i !== index));
  };

  const addCustomItem = () => {
    setCustomItems([...customItems, { name: '', width: 10, length: 10, color: '#808080' }]);
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

  const addStage = () => {
    setStages([...stages, { width: 16, length: 20 }]);
  };

  const updateStage = (index, field, value) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setStages(updated);
  };

  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleFrameTentChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      frame_tent: {
        ...prev.frame_tent,
        [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0
      }
    }));
  };

  const handleAddItems = () => {
    const newItems = [];

    // Only add the difference between current and previous inputs
    ['tent_8x8', 'tent_10x10', 'tent_10x20', 'tent_15x15', 'tent_20x20', 'tent_20x30', 'tent_30x30'].forEach(tent => {
      const toAdd = Math.max(0, inputs[tent] - previousInputs[tent]);
      for (let i = 0; i < toAdd; i++) {
        newItems.push({
          type: tent,
          x: Math.random() * 300,
          y: Math.random() * 300,
          rotation: 0
        });
      }
    });

    const frameTentToAdd = Math.max(0, inputs.frame_tent.count - previousInputs.frame_tent.count);
    for (let i = 0; i < frameTentToAdd; i++) {
      newItems.push({
        type: 'frame_tent',
        width: inputs.frame_tent.width,
        length: inputs.frame_tent.length,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    }

    // Add all video walls
    videoWalls.forEach(vw => {
      newItems.push({
        type: 'video_wall',
        width: 2, // Fixed width of 2ft
        length: vw.length,
        height: vw.height,
        color: vw.color,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    });

    // Add all custom items
    customItems.forEach(item => {
      if (item.name.trim()) {
        newItems.push({
          type: 'custom',
          name: item.name,
          width: item.width || 10,
          length: item.length || 10,
          color: item.color,
          x: 200 + Math.random() * 100,
          y: 200 + Math.random() * 100,
          rotation: 0,
          quantity: 1
        });
      }
    });

    ['toilet', 'handwash', 'sink'].forEach(item => {
      const toAdd = Math.max(0, inputs[item] - previousInputs[item]);
      for (let i = 0; i < toAdd; i++) {
        newItems.push({
          type: item,
          x: Math.random() * 300,
          y: Math.random() * 300,
          rotation: 0
        });
      }
    });

    // Add all stages (each with its own dimensions)
    stages.forEach(stage => {
      newItems.push({
        type: 'stage',
        width: stage.width,
        length: stage.length,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    });

    onAddItems(newItems);
    
    // Clear video walls, custom items, and stages after adding
    setVideoWalls([]);
    setCustomItems([]);
    setStages([]);
    
    // Update previous inputs to current values
    setPreviousInputs({
      tent_8x8: inputs.tent_8x8,
      tent_10x10: inputs.tent_10x10,
      tent_10x20: inputs.tent_10x20,
      tent_15x15: inputs.tent_15x15,
      tent_20x20: inputs.tent_20x20,
      tent_20x30: inputs.tent_20x30,
      tent_30x30: inputs.tent_30x30,
      frame_tent: { ...inputs.frame_tent },
      toilet: inputs.toilet,
      handwash: inputs.handwash,
      sink: inputs.sink,
      stage: { count: 0, width: 16, length: 20 },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ maxHeight: '60vh' }}>
      <div className="overflow-y-auto flex-1">
        <div className="p-3 space-y-2">
      <h3 className="font-semibold text-xs mb-1">Items to Add</h3>

      {/* Attendee & Seating Calculator */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-2">
        <h4 className="text-xs font-semibold text-blue-900">Tent Size Calculator</h4>
        <div>
          <Label htmlFor="attendees" className="text-xs">Number of Attendees</Label>
          <Input 
            id="attendees"
            type="number" 
            value={attendees} 
            onChange={(e) => setAttendees(e.target.value)} 
            placeholder="e.g. 150" 
            min="0"
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label htmlFor="seating" className="text-xs">Seating Arrangement</Label>
          <Select value={seatingArrangement} onValueChange={setSeatingArrangement}>
            <SelectTrigger id="seating" className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presentation">Theater (Chairs Only)</SelectItem>
              <SelectItem value="standing">Cocktail (Standing)</SelectItem>
              <SelectItem value="seated_dinner">Banquet (Rectangular Tables)</SelectItem>
              <SelectItem value="seated_6ft">Banquet (Round Tables)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {suggestedTent && (
          <div className="bg-white rounded p-2 space-y-1">
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Recommended:</span> {suggestedTent.recommended.width}x{suggestedTent.recommended.length} tent
            </p>
            <p className="text-xs text-slate-500">
              Space needed: {suggestedTent.requiredSqFt} sq ft ({suggestedTent.spacePerPerson.min}-{suggestedTent.spacePerPerson.max} sq ft/person)
            </p>
            <Button 
              onClick={applySuggestedTent}
              size="sm"
              className="w-full h-6 text-xs bg-blue-600 hover:bg-blue-700"
            >
              Add Suggested Tent
            </Button>
          </div>
        )}
      </div>

      {/* Tents */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Popup Tents</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="tent_8x8" className="text-xs">8x8</Label>
            <Input type="number" id="tent_8x8" value={inputs.tent_8x8} onChange={(e) => handleTentChange('tent_8x8', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="tent_10x10" className="text-xs">10x10</Label>
            <Input type="number" id="tent_10x10" value={inputs.tent_10x10} onChange={(e) => handleTentChange('tent_10x10', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="tent_10x20" className="text-xs">10x20</Label>
            <Input type="number" id="tent_10x20" value={inputs.tent_10x20} onChange={(e) => handleTentChange('tent_10x20', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Marquee Tents</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="tent_15x15" className="text-xs">15x15</Label>
            <Input type="number" id="tent_15x15" value={inputs.tent_15x15} onChange={(e) => handleTentChange('tent_15x15', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="tent_20x20" className="text-xs">20x20</Label>
            <Input type="number" id="tent_20x20" value={inputs.tent_20x20} onChange={(e) => handleTentChange('tent_20x20', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="tent_20x30" className="text-xs">20x30</Label>
            <Input type="number" id="tent_20x30" value={inputs.tent_20x30} onChange={(e) => handleTentChange('tent_20x30', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="tent_30x30" className="text-xs">30x30</Label>
            <Input type="number" id="tent_30x30" value={inputs.tent_30x30} onChange={(e) => handleTentChange('tent_30x30', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
        </div>
      </div>

      {/* Frame Tents */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Frame Tents</h4>
        <div>
          <Label htmlFor="frame_tent_count" className="text-xs">Quantity</Label>
          <Input type="number" id="frame_tent_count" value={inputs.frame_tent.count} onChange={(e) => handleFrameTentChange('count', e.target.value)} min="0" className="h-8 text-sm w-16" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="frame_tent_width" className="text-xs">Width (ft)</Label>
            <Input type="number" id="frame_tent_width" value={inputs.frame_tent.width} onChange={(e) => handleFrameTentChange('width', e.target.value)} min="10" step="10" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="frame_tent_length" className="text-xs">Length (ft)</Label>
            <Input type="number" id="frame_tent_length" value={inputs.frame_tent.length} onChange={(e) => handleFrameTentChange('length', e.target.value)} min="10" step="10" className="h-8 text-sm w-16" />
          </div>
        </div>
      </div>

      {/* Video Walls */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Video Walls (Width: 2ft)</h4>
        <Button onClick={addVideoWall} variant="outline" className="w-full h-7 text-xs">
          + Add Video Wall
        </Button>
        {videoWalls.map((vw, idx) => (
          <div key={idx} className="border border-slate-200 rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Video Wall {idx + 1}</span>
              <button onClick={() => removeVideoWall(idx)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Length (ft)</Label>
                <Input type="number" value={vw.length} onChange={(e) => updateVideoWall(idx, 'length', e.target.value)} min="1" step="0.5" className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Height (ft)</Label>
                <Input type="number" value={vw.height} onChange={(e) => updateVideoWall(idx, 'height', e.target.value)} min="1" step="0.5" className="h-7 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Select value={vw.color} onValueChange={(value) => updateVideoWall(idx, 'color', value)}>
                <SelectTrigger className="text-xs h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#000000">Black</SelectItem>
                  <SelectItem value="#1a1a1a">Gray</SelectItem>
                  <SelectItem value="#FF0000">Red</SelectItem>
                  <SelectItem value="#00FF00">Green</SelectItem>
                  <SelectItem value="#0000FF">Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Items */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Custom Items</h4>
        <Button onClick={addCustomItem} variant="outline" className="w-full h-7 text-xs">
          + Add Custom Item
        </Button>
        {customItems.map((item, idx) => (
          <div key={idx} className="border border-slate-200 rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Custom Item {idx + 1}</span>
              <button onClick={() => removeCustomItem(idx)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
            </div>
            <div>
              <Label className="text-xs">Name</Label>
              <Input type="text" value={item.name} onChange={(e) => updateCustomItem(idx, 'name', e.target.value)} placeholder="Item name" className="h-7 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width (ft)</Label>
                <Input type="number" value={item.width} onChange={(e) => updateCustomItem(idx, 'width', e.target.value)} min="1" step="0.5" className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Length (ft)</Label>
                <Input type="number" value={item.length} onChange={(e) => updateCustomItem(idx, 'length', e.target.value)} min="1" step="0.5" className="h-7 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <input type="color" value={item.color} onChange={(e) => updateCustomItem(idx, 'color', e.target.value)} className="h-7 w-full rounded border" />
            </div>
          </div>
        ))}
      </div>

      {/* Facilities */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Facilities</h4>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="toilet" className="text-xs">Toilets</Label>
            <Input type="number" id="toilet" value={inputs.toilet} onChange={(e) => handleTentChange('toilet', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="handwash" className="text-xs">Handwash</Label>
            <Input type="number" id="handwash" value={inputs.handwash} onChange={(e) => handleTentChange('handwash', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="sink" className="text-xs">Sinks</Label>
            <Input type="number" id="sink" value={inputs.sink} onChange={(e) => handleTentChange('sink', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-slate-600">Stages</h4>
        <Button onClick={addStage} variant="outline" className="w-full h-7 text-xs">
          + Add Stage
        </Button>
        {stages.map((stage, idx) => (
          <div key={idx} className="border border-slate-200 rounded p-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Stage {idx + 1}</span>
              <button onClick={() => removeStage(idx)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width (ft)</Label>
                <Input type="number" value={stage.width} onChange={(e) => updateStage(idx, 'width', e.target.value)} min="1" step="1" className="h-7 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Length (ft)</Label>
                <Input type="number" value={stage.length} onChange={(e) => updateStage(idx, 'length', e.target.value)} min="1" step="1" className="h-7 text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>

        </div>
      </div>
      <div className="p-3 border-t border-slate-100">
        <Button onClick={handleAddItems} className="w-full h-8 text-sm bg-green-600 hover:bg-green-700">
          Add Items
        </Button>
      </div>
    </div>
  );
}