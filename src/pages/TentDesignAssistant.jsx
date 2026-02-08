import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TentInputPanel from '@/components/tent/TentInputPanel';
import TentCanvas2D from '@/components/tent/TentCanvas2D';

import TentGearList from '@/components/tent/TentGearList';
import { Sparkles, Plus, Camera, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TentDesignAssistant() {
  const [projectName, setProjectName] = useState('');
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

  const [showGearList, setShowGearList] = useState(false);
  const [items, setItems] = useState([]);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const canvasRef = useRef(null);

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const projectData = {
      project_name: projectName,
      attendees,
      seating_arrangement: seatingArrangement,
      tent_style: tentStyle,
      tent_width: tentConfig.width,
      tent_length: tentConfig.length,
      tent_config: tentConfig
    };

    try {
      if (currentProjectId) {
        await base44.entities.TentProject.update(currentProjectId, projectData);
      } else {
        const newProject = await base44.entities.TentProject.create(projectData);
        setCurrentProjectId(newProject.id);
      }
      alert('Project saved successfully!');
    } catch (error) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleLoadProject = (project) => {
    setProjectName(project.project_name);
    setAttendees(project.attendees);
    setSeatingArrangement(project.seating_arrangement);
    setTentStyle(project.tent_style);
    setTentConfig(project.tent_config);
    setCurrentProjectId(project.id);
    setShowLoadModal(false);
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      // Build detailed prompt based on equipment
      let equipmentDetails = [];
      
      if (tentConfig.stages?.length > 0) {
        equipmentDetails.push('a glamorous professional stage with dramatic lighting and LED panels');
      }
      if (tentConfig.danceFloors?.length > 0) {
        equipmentDetails.push('an elegant dance floor with geometric LED patterns and dramatic uplighting');
      }
      if (tentConfig.bars?.length > 0) {
        equipmentDetails.push('a luxurious modern bar with backlit shelves and premium finishes');
      }
      if (tentConfig.tables8ft?.length > 0 || tentConfig.tables6ft?.length > 0 || tentConfig.tables5ft?.length > 0) {
        equipmentDetails.push(`elegant round tables with ${tentConfig.linenColor || 'white'} linens, centerpieces with flowers and candles`);
      }
      if (tentConfig.videoWalls?.length > 0) {
        equipmentDetails.push('large LED video walls displaying elegant graphics');
      }
      if (tentConfig.cocktailTables?.length > 0) {
        equipmentDetails.push('cocktail tables with ambient lighting');
      }

      const tentTypeDesc = tentStyle === 'marquee' ? 'marquee tent with peaked ceiling and draped fabric' : 'modern frame tent with high ceilings';
      const equipmentText = equipmentDetails.length > 0 ? equipmentDetails.join(', ') : 'elegant setup';

      const prompt = `Ultra-realistic professional photograph of a luxury event inside a ${suggestedTent?.type || '40x60'} ft ${tentTypeDesc}. The event space features ${equipmentText}. Warm ambient lighting with chandeliers, sophisticated atmosphere, ${attendees} guests enjoying the space. Professional event photography, high-end venue styling, cinematic lighting, 8k quality, photorealistic.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      setGeneratedImage(response.url);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setGeneratingImage(false);
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Inputs */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            {/* Project Name */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Label className="text-sm font-semibold">Project Name</Label>
              <Input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

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
                <div className="mt-4 p-3 bg-purple-50 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Suggested Tent:</p>
                    <p className="text-lg font-bold text-purple-700">{suggestedTent.type} ft</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Tent Style</Label>
                    <Select value={tentStyle} onValueChange={setTentStyle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tent style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marquee">Marquee (Peaked)</SelectItem>
                        <SelectItem value="frame">Frame (Modern)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
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
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleGenerateImage}
                  disabled={items.length === 0 || generatingImage}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {generatingImage ? 'Generating...' : 'A.I. Designer'}
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleRender2D}>
                  2D Render
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
          <div className="col-span-1 lg:col-span-2">
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
      {showGearList && (
        <TentGearList
          tentConfig={tentConfig}
          items={items}
          onClose={() => setShowGearList(false)}
        />
      )}

      {generatedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-slate-900">Generated Event Visualization</h3>
              <Button variant="ghost" size="icon" onClick={() => setGeneratedImage(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-auto flex items-center justify-center">
              <img src={generatedImage} alt="Generated event" className="max-w-full max-h-full rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}