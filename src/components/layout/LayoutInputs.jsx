import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LayoutInputs({ onAddItems }) {
  const [inputs, setInputs] = useState({
    tent_10x10: 0,
    tent_10x20: 0,
    tent_15x15: 0,
    tent_20x20: 0,
    tent_20x30: 0,
    video_wall: { count: 0, width: 10, height: 8, color: '#000000' },
    toilet: 0,
    handwash: 0,
    sink: 0,
    stage: { count: 0, width: 16, length: 20, isSl100: false },
  });

  const handleTentChange = (tentType, value) => {
    setInputs(prev => ({
      ...prev,
      [tentType]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleVideoWallChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      video_wall: {
        ...prev.video_wall,
        [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : field === 'color' ? value : parseFloat(value) || 0
      }
    }));
  };

  const handleStageChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      stage: {
        ...prev.stage,
        [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : field === 'isSl100' ? value : parseFloat(value) || 0
      }
    }));
  };

  const handleAddItems = () => {
    const newItems = [];

    ['tent_10x10', 'tent_10x20', 'tent_15x15', 'tent_20x20', 'tent_20x30'].forEach(tent => {
      for (let i = 0; i < inputs[tent]; i++) {
        newItems.push({
          type: tent,
          x: Math.random() * 300,
          y: Math.random() * 300,
          rotation: 0
        });
      }
    });

    for (let i = 0; i < inputs.video_wall.count; i++) {
      newItems.push({
        type: 'video_wall',
        width: inputs.video_wall.width,
        height: inputs.video_wall.height,
        color: inputs.video_wall.color,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    }

    ['toilet', 'handwash', 'sink'].forEach(item => {
      for (let i = 0; i < inputs[item]; i++) {
        newItems.push({
          type: item,
          x: Math.random() * 300,
          y: Math.random() * 300,
          rotation: 0
        });
      }
    });

    for (let i = 0; i < inputs.stage.count; i++) {
      newItems.push({
        type: 'stage',
        width: inputs.stage.width,
        length: inputs.stage.length,
        isSl100: inputs.stage.isSl100,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    }

    onAddItems(newItems);
    
    // Reset inputs
    setInputs({
      tent_10x10: 0,
      tent_10x20: 0,
      tent_15x15: 0,
      tent_20x20: 0,
      tent_20x30: 0,
      video_wall: { count: 0, width: 10, height: 8, color: '#000000' },
      toilet: 0,
      handwash: 0,
      sink: 0,
      stage: { count: 0, width: 16, length: 20, isSl100: false },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 max-h-96 overflow-y-auto">
      <h3 className="font-semibold text-sm">Items to Add</h3>

      {/* Tents */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-600">Popup Tents</h4>
        <div className="space-y-2">
          <div>
            <Label htmlFor="tent_10x10" className="text-xs">10x10 Tents</Label>
            <Input type="number" id="tent_10x10" value={inputs.tent_10x10} onChange={(e) => handleTentChange('tent_10x10', e.target.value)} min="0" />
          </div>
          <div>
            <Label htmlFor="tent_10x20" className="text-xs">10x20 Tents</Label>
            <Input type="number" id="tent_10x20" value={inputs.tent_10x20} onChange={(e) => handleTentChange('tent_10x20', e.target.value)} min="0" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-600">Marquee Tents</h4>
        <div className="space-y-2">
          <div>
            <Label htmlFor="tent_15x15" className="text-xs">15x15 Tents</Label>
            <Input type="number" id="tent_15x15" value={inputs.tent_15x15} onChange={(e) => handleTentChange('tent_15x15', e.target.value)} min="0" />
          </div>
          <div>
            <Label htmlFor="tent_20x20" className="text-xs">20x20 Tents</Label>
            <Input type="number" id="tent_20x20" value={inputs.tent_20x20} onChange={(e) => handleTentChange('tent_20x20', e.target.value)} min="0" />
          </div>
          <div>
            <Label htmlFor="tent_20x30" className="text-xs">20x30 Tents</Label>
            <Input type="number" id="tent_20x30" value={inputs.tent_20x30} onChange={(e) => handleTentChange('tent_20x30', e.target.value)} min="0" />
          </div>
        </div>
      </div>

      {/* Video Walls */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-600">Video Walls</h4>
        <div>
          <Label htmlFor="vw_count" className="text-xs">Quantity</Label>
          <Input type="number" id="vw_count" value={inputs.video_wall.count} onChange={(e) => handleVideoWallChange('count', e.target.value)} min="0" />
        </div>
        <div>
          <Label htmlFor="vw_width" className="text-xs">Width (ft)</Label>
          <Input type="number" id="vw_width" value={inputs.video_wall.width} onChange={(e) => handleVideoWallChange('width', e.target.value)} min="1" step="0.5" />
        </div>
        <div>
          <Label htmlFor="vw_height" className="text-xs">Height (ft)</Label>
          <Input type="number" id="vw_height" value={inputs.video_wall.height} onChange={(e) => handleVideoWallChange('height', e.target.value)} min="1" step="0.5" />
        </div>
        <div>
          <Label htmlFor="vw_color" className="text-xs">Color</Label>
          <Select value={inputs.video_wall.color} onValueChange={(value) => handleVideoWallChange('color', value)}>
            <SelectTrigger id="vw_color" className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="#000000">Black</SelectItem>
              <SelectItem value="#1a1a1a">Dark Gray</SelectItem>
              <SelectItem value="#FF0000">Red</SelectItem>
              <SelectItem value="#00FF00">Green</SelectItem>
              <SelectItem value="#0000FF">Blue</SelectItem>
              <SelectItem value="#FFFF00">Yellow</SelectItem>
              <SelectItem value="#00FFFF">Cyan</SelectItem>
              <SelectItem value="#FF00FF">Magenta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Facilities */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-600">Facilities</h4>
        <div>
          <Label htmlFor="toilet" className="text-xs">Portable Toilets</Label>
          <Input type="number" id="toilet" value={inputs.toilet} onChange={(e) => handleTentChange('toilet', e.target.value)} min="0" />
        </div>
        <div>
          <Label htmlFor="handwash" className="text-xs">Hand Wash Stations</Label>
          <Input type="number" id="handwash" value={inputs.handwash} onChange={(e) => handleTentChange('handwash', e.target.value)} min="0" />
        </div>
        <div>
          <Label htmlFor="sink" className="text-xs">Cooking Sinks</Label>
          <Input type="number" id="sink" value={inputs.sink} onChange={(e) => handleTentChange('sink', e.target.value)} min="0" />
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-600">Stages</h4>
        <div>
          <Label htmlFor="stage_count" className="text-xs">Quantity</Label>
          <Input type="number" id="stage_count" value={inputs.stage.count} onChange={(e) => handleStageChange('count', e.target.value)} min="0" />
        </div>
        <label className="flex items-center space-x-2 text-xs">
          <input
            type="checkbox"
            checked={inputs.stage.isSl100}
            onChange={(e) => handleStageChange('isSl100', e.target.checked)}
            className="w-3 h-3"
          />
          <span>SL 100 Stage Line ($5000 each)</span>
        </label>
        {!inputs.stage.isSl100 && (
          <>
            <div>
              <Label htmlFor="stage_width" className="text-xs">Width (ft)</Label>
              <Input type="number" id="stage_width" value={inputs.stage.width} onChange={(e) => handleStageChange('width', e.target.value)} min="1" />
            </div>
            <div>
              <Label htmlFor="stage_length" className="text-xs">Length (ft)</Label>
              <Input type="number" id="stage_length" value={inputs.stage.length} onChange={(e) => handleStageChange('length', e.target.value)} min="1" />
            </div>
          </>
        )}
      </div>

      <Button onClick={handleAddItems} className="w-full bg-green-600 hover:bg-green-700">
        Add Items
      </Button>
    </div>
  );
}