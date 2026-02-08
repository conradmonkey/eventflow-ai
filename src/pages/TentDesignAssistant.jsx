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
    chairs: { rows: 0, perRow: 0 }
  });
  const [show3D, setShow3D] = useState(false);
  const [showGearList, setShowGearList] = useState(false);
  const [items, setItems] = useState([]);
  const canvasRef = useRef(null);

  const getSuggestedTent = (people, arrangement) => {
    // This will be enhanced when spreadsheet data is loaded
    let sqftPerPerson = 10;
    
    switch(arrangement) {
      case 'standing':
        sqftPerPerson = 6;
        break;
      case 'seated_8ft':
        sqftPerPerson = 12;
        break;
      case 'seated_6ft':
        sqftPerPerson = 10;
        break;
      case 'seated_5ft':
        sqftPerPerson = 10;
        break;
      case 'presentation':
        sqftPerPerson = 8;
        break;
    }

    const totalSqft = people * sqftPerPerson;
    const side = Math.sqrt(totalSqft);
    const width = Math.round(side / 10) * 10;
    const length = Math.round(totalSqft / width / 10) * 10;

    return { width, length, type: `${width}x${length}` };
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