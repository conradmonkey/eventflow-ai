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
import { Sparkles } from 'lucide-react';

export default function TentDesignAssistant() {
  const [attendees, setAttendees] = useState(100);
  const [seatingArrangement, setSeatingArrangement] = useState('');
  const [suggestedTent, setSuggestedTent] = useState(null);
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

    // Add stages
    tentConfig.stages.forEach((stage, idx) => {
      newItems.push({
        type: 'stage',
        width: stage.width,
        length: stage.length,
        height: stage.height,
        color: stage.color,
        x: 100 + idx * 50,
        y: 100,
        rotation: 0
      });
    });

    // Add video walls
    tentConfig.videoWalls.forEach((wall, idx) => {
      newItems.push({
        type: 'videoWall',
        width: wall.length,
        height: wall.height,
        x: 100 + idx * 50,
        y: 200,
        rotation: 0
      });
    });

    // Add dance floors
    tentConfig.danceFloors.forEach((floor, idx) => {
      newItems.push({
        type: 'danceFloor',
        width: floor.width,
        length: floor.length,
        color: floor.color,
        x: 300 + idx * 50,
        y: 200,
        rotation: 0
      });
    });

    // Add 8ft tables
    for (let i = 0; i < tentConfig.tables8ft.length; i++) {
      newItems.push({
        type: 'table8ft',
        width: 8,
        length: 2.5,
        color: tentConfig.tables8ft[i].color,
        x: 150 + (i % 5) * 40,
        y: 300 + Math.floor(i / 5) * 40,
        rotation: 0
      });
    }

    // Add 6ft tables
    for (let i = 0; i < tentConfig.tables6ft.length; i++) {
      newItems.push({
        type: 'table6ft',
        width: 6,
        length: 2.5,
        color: tentConfig.tables6ft[i].color,
        x: 150 + (i % 5) * 40,
        y: 400 + Math.floor(i / 5) * 40,
        rotation: 0
      });
    }

    // Add 5ft round tables
    for (let i = 0; i < tentConfig.tables5ft.length; i++) {
      newItems.push({
        type: 'table5ft',
        diameter: 5,
        color: tentConfig.tables5ft[i].color,
        x: 150 + (i % 5) * 40,
        y: 500 + Math.floor(i / 5) * 40,
        rotation: 0
      });
    }

    // Add bars
    tentConfig.bars.forEach((bar, idx) => {
      newItems.push({
        type: 'bar',
        width: bar.width,
        length: bar.length,
        x: 400 + idx * 50,
        y: 100,
        rotation: 0
      });
    });

    // Add cocktail tables
    for (let i = 0; i < tentConfig.cocktailTables.length; i++) {
      newItems.push({
        type: 'cocktailTable',
        diameter: 2.5,
        color: tentConfig.cocktailTables[i].color,
        x: 400 + (i % 5) * 30,
        y: 300 + Math.floor(i / 5) * 30,
        rotation: 0
      });
    }

    // Add presentation chairs
    if (seatingArrangement === 'presentation') {
      const { rows, perRow } = tentConfig.chairs;
      let chairGroup = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < perRow; col++) {
          chairGroup.push({
            type: 'chair',
            width: 2,
            length: 2,
            x: 200 + col * 3,
            y: 400 + row * 6,
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
          x: 250 + idx * 50,
          y: 250,
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShow3D(true)}
                  disabled={items.length === 0}
                >
                  3D Render
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