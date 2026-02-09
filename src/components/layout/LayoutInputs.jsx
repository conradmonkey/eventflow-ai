import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    video_wall: { count: 0, width: 10, height: 8, color: '#000000' },
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
    video_wall: { count: 0, width: 10, height: 8, color: '#000000' },
    toilet: 0,
    handwash: 0,
    sink: 0,
    stage: { count: 0, width: 16, length: 20 },
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
        [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : parseFloat(value) || 0
      }
    }));
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

    const videoWallToAdd = Math.max(0, inputs.video_wall.count - previousInputs.video_wall.count);
    for (let i = 0; i < videoWallToAdd; i++) {
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

    const stageToAdd = Math.max(0, inputs.stage.count - previousInputs.stage.count);
    for (let i = 0; i < stageToAdd; i++) {
      newItems.push({
        type: 'stage',
        width: inputs.stage.width,
        length: inputs.stage.length,
        x: Math.random() * 300,
        y: Math.random() * 300,
        rotation: 0
      });
    }

    onAddItems(newItems);
    
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
      video_wall: { ...inputs.video_wall },
      toilet: inputs.toilet,
      handwash: inputs.handwash,
      sink: inputs.sink,
      stage: { ...inputs.stage },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 space-y-2 max-h-96 overflow-y-auto">
      <h3 className="font-semibold text-xs mb-1">Items to Add</h3>

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
        <h4 className="text-xs font-semibold text-slate-600">Video Walls</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vw_count" className="text-xs">Qty</Label>
            <Input type="number" id="vw_count" value={inputs.video_wall.count} onChange={(e) => handleVideoWallChange('count', e.target.value)} min="0" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="vw_color" className="text-xs">Color</Label>
            <Select value={inputs.video_wall.color} onValueChange={(value) => handleVideoWallChange('color', value)}>
              <SelectTrigger id="vw_color" className="text-xs h-8">
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
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vw_width" className="text-xs">Width (ft)</Label>
            <Input type="number" id="vw_width" value={inputs.video_wall.width} onChange={(e) => handleVideoWallChange('width', e.target.value)} min="1" step="0.5" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="vw_height" className="text-xs">Height (ft)</Label>
            <Input type="number" id="vw_height" value={inputs.video_wall.height} onChange={(e) => handleVideoWallChange('height', e.target.value)} min="1" step="0.5" className="h-8 text-sm w-16" />
          </div>
        </div>
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
        <div>
          <Label htmlFor="stage_count" className="text-xs">Quantity</Label>
          <Input type="number" id="stage_count" value={inputs.stage.count} onChange={(e) => handleStageChange('count', e.target.value)} min="0" className="h-8 text-sm w-16" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="stage_width" className="text-xs">Width (ft)</Label>
            <Input type="number" id="stage_width" value={inputs.stage.width} onChange={(e) => handleStageChange('width', e.target.value)} min="1" className="h-8 text-sm w-16" />
          </div>
          <div>
            <Label htmlFor="stage_length" className="text-xs">Length (ft)</Label>
            <Input type="number" id="stage_length" value={inputs.stage.length} onChange={(e) => handleStageChange('length', e.target.value)} min="1" className="h-8 text-sm w-16" />
          </div>
        </div>
      </div>

      <Button onClick={handleAddItems} className="w-full h-8 text-sm bg-green-600 hover:bg-green-700">
        Add Items
      </Button>
    </div>
  );
}