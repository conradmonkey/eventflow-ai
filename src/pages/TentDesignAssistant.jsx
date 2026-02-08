import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TentInputPanel from '@/components/tent/TentInputPanel';
import TentCanvas2D from '@/components/tent/TentCanvas2D';
import TentCanvas3D from '@/components/tent/TentCanvas3D';
import TentGearList from '@/components/tent/TentGearList';
import { Sparkles, Plus } from 'lucide-react';

export default function TentDesignAssistant() {
  const [attendees, setAttendees] = useState(100);
  const [seatingArrangement, setSeatingArrangement] = useState('');
  const [suggestedTent, setSuggestedTent] = useState(null);
  const [tentStyle, setTentStyle] = useState('marquee');
  const [tentConfig, setTentConfig] = useState({
    length: 0,
    width: 0,
    stages: [],
    videoWalls: [],
    danceFloors: [],
    tables8ft: [],
    tables6ft: [],
    tables5ft: [],
    bars: [],
    cocktailTables: [],
    linenColor: '#FFFFFF',
    chairs: { rows: 0, perRow: 0 },
    customEquipment: []
  });
  const [show3D, setShow3D] = useState(false);
  const [showGearList, setShowGearList] = useState(false);
  const [items, setItems] = useState([]);
  const canvasRef = useRef(null);
  const [customEquipment, setCustomEquipment] = useState({
    name: '',
    width: 10,
    length: 10,
    color: '#888888'
  });

  const addCustomEquipment = () => {
    if (!customEquipment.name) return;
    setTentConfig(prev => ({
      ...prev,
      customEquipment: [...(prev.customEquipment || []), { ...customEquipment }]
    }));
    setCustomEquipment({ name: '', width: 10, length: 10, color: '#888888' });
  };

  const tentData = {
    "20x20": { standing: 60, presentation: 70, seated_5ft: 40, seated_8ft: 50, width: 20, length: 20 },
    "30x20": { standing: 90, presentation: 110, seated_5ft: 60, seated_8ft: 75, width: 30, length: 20 },
    "20x40": { standing: 120, presentation: 140, seated_5ft: 80, seated_8ft: 100, width: 20, length: 40 },
    "30x30": { standing: 150, presentation: 180, seated_5ft: 90, seated_8ft: 110, width: 30, length: 30 },
    "30x45": { standing: 225, presentation: 270, seated_5ft: 130, seated_8ft: 165, width: 30, length: 45 },
    "30x60": { standing: 300, presentation: 360, seated_5ft: 180, seated_8ft: 220, width: 30, length: 60 },
    "40x40": { standing: 250, presentation: 320, seated_5ft: 160, seated_8ft: 200, width: 40, length: 40 },
    "40x60": { standing: 400, presentation: 480, seated_5ft: 240, seated_8ft: 300, width: 40, length: 60 },
    "40x80": { standing: 530, presentation: 640, seated_5ft: 320, seated_8ft: 400, width: 40, length: 80 },
    "40x100": { standing: 660, presentation: 800, seated_5ft: 400, seated_8ft: 500, width: 40, length: 100 },
    "60x60": { standing: 690, presentation: 720, seated_5ft: 360, seated_8ft: 450, width: 60, length: 60 },
    "60x80": { standing: 800, presentation: 960, seated_5ft: 480, seated_8ft: 600, width: 60, length: 80 },
    "60x100": { standing: 1000, presentation: 1200, seated_5ft: 600, seated_8ft: 750, width: 60, length: 100 },
    "60x120": { standing: 1200, presentation: 1440, seated_5ft: 720, seated_8ft: 900, width: 60, length: 120 }
  };

  const getSuggestedTent = (people, arrangement) => {
    const capacityKey = arrangement;
    
    // Find the smallest tent that can accommodate the number of people
    let bestTent = null;
    let smallestSize = Infinity;
    
    Object.entries(tentData).forEach(([tentSize, data]) => {
      const capacity = data[capacityKey];
      if (capacity >= people) {
        const sqft = data.width * data.length;
        if (sqft < smallestSize) {
          smallestSize = sqft;
          bestTent = { width: data.width, length: data.length, type: tentSize };
        }
      }
    });

    // If no tent is large enough, return the largest one
    if (!bestTent) {
      bestTent = { width: 60, length: 120, type: "60x120" };
    }

    return bestTent;
  };

  const handleSeatingChange = (arrangement) => {
    setSeatingArrangement(arrangement);
    const suggestion = getSuggestedTent(attendees, arrangement);
    setSuggestedTent(suggestion);
    setTentConfig(prev => ({
      ...prev,
      length: suggestion.length,
      width: suggestion.width
    }));
  };

  const handleRender2D = () => {
    const newItems = [];
    const tentLength = tentConfig.length;
    const tentWidth = tentConfig.width;

    // Add stages - position in top area
    tentConfig.stages.forEach((stage, idx) => {
      newItems.push({
        type: 'stage',
        width: stage.width,
        length: stage.length,
        height: stage.height,
        color: stage.color,
        x: tentLength * 0.2 + idx * (stage.width + 5),
        y: tentWidth * 0.15,
        rotation: 0
      });
    });

    // Add video walls - near stages
    tentConfig.videoWalls.forEach((wall, idx) => {
      newItems.push({
        type: 'videoWall',
        width: wall.length,
        height: wall.height,
        x: tentLength * 0.5 + idx * (wall.length + 3),
        y: tentWidth * 0.15,
        rotation: 0
      });
    });

    // Add dance floors - center area
    tentConfig.danceFloors.forEach((floor, idx) => {
      newItems.push({
        type: 'danceFloor',
        width: floor.width,
        length: floor.length,
        color: floor.color,
        x: tentLength * 0.5,
        y: tentWidth * 0.5 + idx * (floor.length + 3),
        rotation: 0
      });
    });

    // Add 8ft tables - arranged in rows
    const tables8ftPerRow = Math.floor(tentLength / 12);
    for (let i = 0; i < tentConfig.tables8ft.length; i++) {
      newItems.push({
        type: 'table8ft',
        width: 8,
        length: 2.5,
        color: tentConfig.tables8ft[i].color,
        x: 10 + (i % tables8ftPerRow) * 10,
        y: tentWidth * 0.6 + Math.floor(i / tables8ftPerRow) * 5,
        rotation: 0
      });
    }

    // Add 6ft tables
    const tables6ftPerRow = Math.floor(tentLength / 10);
    for (let i = 0; i < tentConfig.tables6ft.length; i++) {
      newItems.push({
        type: 'table6ft',
        width: 6,
        length: 2.5,
        color: tentConfig.tables6ft[i].color,
        x: 10 + (i % tables6ftPerRow) * 8,
        y: tentWidth * 0.7 + Math.floor(i / tables6ftPerRow) * 5,
        rotation: 0
      });
    }

    // Add 5ft round tables
    const tables5ftPerRow = Math.floor(tentLength / 8);
    for (let i = 0; i < tentConfig.tables5ft.length; i++) {
      newItems.push({
        type: 'table5ft',
        diameter: 5,
        color: tentConfig.tables5ft[i].color,
        x: 10 + (i % tables5ftPerRow) * 7,
        y: tentWidth * 0.8 + Math.floor(i / tables5ftPerRow) * 6,
        rotation: 0
      });
    }

    // Add bars - side area
    tentConfig.bars.forEach((bar, idx) => {
      newItems.push({
        type: 'bar',
        width: bar.width,
        length: bar.length,
        x: tentLength * 0.85,
        y: tentWidth * 0.2 + idx * (bar.length + 5),
        rotation: 0
      });
    });

    // Add cocktail tables - scattered
    const cocktailPerRow = Math.floor(tentLength / 5);
    for (let i = 0; i < tentConfig.cocktailTables.length; i++) {
      newItems.push({
        type: 'cocktailTable',
        diameter: 2.5,
        color: tentConfig.cocktailTables[i].color,
        x: tentLength * 0.15 + (i % cocktailPerRow) * 4,
        y: tentWidth * 0.3 + Math.floor(i / cocktailPerRow) * 4,
        rotation: 0
      });
    }

    // Add presentation chairs
    if (seatingArrangement === 'presentation') {
      const { rows, perRow } = tentConfig.chairs;
      let chairGroup = [];
      const chairSpacing = 3;
      const startX = (tentLength - (perRow * chairSpacing)) / 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < perRow; col++) {
          chairGroup.push({
            type: 'chair',
            width: 2,
            length: 2,
            x: startX + col * chairSpacing,
            y: tentWidth * 0.5 + row * 3,
            rotation: 0,
            groupId: 'chairs'
          });
        }
      }
      newItems.push(...chairGroup);
    }

    // Add custom equipment
    if (tentConfig.customEquipment) {
      tentConfig.customEquipment.forEach((equipment, idx) => {
        newItems.push({
          type: 'customEquipment',
          name: equipment.name,
          width: equipment.width,
          length: equipment.length,
          color: equipment.color,
          x: tentLength * 0.3 + idx * (equipment.width + 3),
          y: tentWidth * 0.3,
          rotation: 0
        });
      });
    }

    setItems(newItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-4xl font-bold text-slate-900">AI Tent Design Visualizer</h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Inputs */}
          <div className="col-span-1 space-y-6">
            {/* Attendees Slider */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Label className="text-sm font-semibold">Number of Attendees</Label>
              <div className="space-y-4">
                <Slider
                  value={[attendees]}
                  onValueChange={(value) => setAttendees(value[0])}
                  max={1000}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value) || 0)}
                  className="text-center text-lg font-bold"
                />
              </div>
            </div>

            {/* Seating Arrangement */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Label className="text-sm font-semibold">Seating Arrangement</Label>
              <Select value={seatingArrangement} onValueChange={handleSeatingChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select arrangement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standing">Standing</SelectItem>
                  <SelectItem value="seated_8ft">Seated - 8ft Buffet Tables</SelectItem>
                  <SelectItem value="seated_6ft">Seated - 6ft Buffet Tables</SelectItem>
                  <SelectItem value="seated_5ft">Seated - 5ft Round Tables</SelectItem>
                  <SelectItem value="presentation">Seated - Presentation Style</SelectItem>
                </SelectContent>
              </Select>

              {suggestedTent && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900">Suggested Tent:</p>
                  <p className="text-lg font-bold text-purple-700">{suggestedTent.type} ft</p>
                </div>
              )}
            </div>

            {/* Input Panel */}
            {seatingArrangement && (
              <TentInputPanel
                tentConfig={tentConfig}
                setTentConfig={setTentConfig}
                seatingArrangement={seatingArrangement}
                attendees={attendees}
              />
            )}

            {/* Render Buttons */}
            {seatingArrangement && (
              <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleRender2D}>
                  2D Render
                </Button>

                {/* Custom Equipment */}
                <div className="pt-3 border-t space-y-2">
                  <Label className="text-sm font-semibold">Add Custom Equipment</Label>
                  <Input
                    placeholder="Equipment name"
                    value={customEquipment.name}
                    onChange={(e) => setCustomEquipment(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Width (ft)"
                      value={customEquipment.width}
                      onChange={(e) => setCustomEquipment(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                    />
                    <Input
                      type="number"
                      placeholder="Length (ft)"
                      value={customEquipment.length}
                      onChange={(e) => setCustomEquipment(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <Input
                    type="color"
                    value={customEquipment.color}
                    onChange={(e) => setCustomEquipment(prev => ({ ...prev, color: e.target.value }))}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full" 
                    onClick={addCustomEquipment}
                    disabled={!customEquipment.name}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Equipment
                  </Button>
                  {tentConfig.customEquipment && tentConfig.customEquipment.length > 0 && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      <p className="font-semibold mb-1">Added:</p>
                      {tentConfig.customEquipment.map((eq, idx) => (
                        <p key={idx}>• {eq.name} ({eq.width}x{eq.length}ft)</p>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShow3D(true)}
                  disabled={items.length === 0}
                >
                  Artistic Visualization
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowGearList(true)}
                  disabled={items.length === 0}
                >
                  Gear List
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div className="col-span-2">
            <TentCanvas2D
              tentConfig={tentConfig}
              items={items}
              setItems={setItems}
              canvasRef={canvasRef}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {show3D && (
        <TentCanvas3D
          tentConfig={tentConfig}
          items={items}
          attendees={attendees}
          tentType={suggestedTent?.type}
          onClose={() => setShow3D(false)}
        />
      )}

      {showGearList && (
        <TentGearList
          tentConfig={tentConfig}
          items={items}
          onClose={() => setShowGearList(false)}
        />
      )}
    </div>
  );
}