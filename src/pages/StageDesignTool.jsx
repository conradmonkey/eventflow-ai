import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Theater, Plus, Trash2, Loader2, Box } from "lucide-react";
import { motion } from "framer-motion";

export default function StageDesignTool() {
  const [tiers, setTiers] = useState([
    { id: 1, length: "", width: "", height: "" }
  ]);
  const [railings, setRailings] = useState({
    back: false,
    left: false,
    right: false
  });
  const [roofStructure, setRoofStructure] = useState("none");
  const [stageColor, setStageColor] = useState("black");
  const [sketchUrl, setSketchUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const sketchRef = useRef(null);

  const addTier = () => {
    setTiers([...tiers, { id: Date.now(), length: "", width: "", height: "" }]);
  };

  const removeTier = (id) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter(tier => tier.id !== id));
    }
  };

  const updateTier = (id, field, value) => {
    setTiers(tiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const calculateDeckPlatforms = (length, width) => {
    const lengthFt = parseFloat(length);
    const widthFt = parseFloat(width);
    
    let platforms = { '4x8': 0, '4x4': 0, '4x2': 0 };
    let remainingArea = lengthFt * widthFt;

    // Maximize 4x8 platforms (32 sq ft each)
    const num4x8 = Math.floor(lengthFt / 8) * Math.floor(widthFt / 4);
    platforms['4x8'] = num4x8;
    remainingArea -= num4x8 * 32;

    // Then 4x4 platforms (16 sq ft each)
    const remaining4x4 = Math.floor(remainingArea / 16);
    platforms['4x4'] = remaining4x4;
    remainingArea -= remaining4x4 * 16;

    // Finally 4x2 platforms (8 sq ft each)
    const num4x2 = Math.ceil(remainingArea / 8);
    platforms['4x2'] = num4x2;

    return platforms;
  };

  const validateTiers = () => {
    if (tiers.length === 0) return [];
    
    const validTiers = [];
    let prevTier = null;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const length = parseFloat(tier.length);
      const width = parseFloat(tier.width);
      const height = parseFloat(tier.height);

      if (!length || !width || !height) continue;

      if (i === 0) {
        validTiers.push({ ...tier, length, width, height });
        prevTier = { length, width, height };
      } else {
        if (length <= prevTier.length && width <= prevTier.width) {
          validTiers.push({ ...tier, length, width, height });
          prevTier = { length, width, height };
        }
      }
    }

    return validTiers;
  };

  const selectMarqueeTent = (stageLength, stageWidth) => {
    const marqueeOptions = [
      { name: "30'x30'", length: 30, width: 30 },
      { name: "10'x30'", length: 30, width: 10 },
      { name: "10'x20'", length: 20, width: 10 },
      { name: "10'x10'", length: 10, width: 10 }
    ];

    let selectedTent = marqueeOptions[marqueeOptions.length - 1];
    for (const tent of marqueeOptions) {
      if (tent.length <= stageLength && tent.width <= stageWidth) {
        selectedTent = tent;
        break;
      }
    }

    return selectedTent;
  };

  const handleGenerateSketch = async (overrideRoof = null) => {
    setIsGenerating(true);

    try {
      const validTiers = validateTiers();
      
      if (validTiers.length === 0) {
        alert("Please enter valid dimensions for at least one tier.");
        setIsGenerating(false);
        return;
      }
      
      setSketchUrl(null);

      const currentRoof = overrideRoof !== null ? overrideRoof : roofStructure;
      const baseTierLength = validTiers[0].length;
      const baseTierWidth = validTiers[0].width;

      let prompt = `Create a technical 3D drawing of a stage design viewed from the front (audience perspective).

STAGE CONFIGURATION:
The stage is composed of ${validTiers.length} tier(s) made from steel deck platforms (4'×8', 4'×4', 4'×2' sizes).

`;

      validTiers.forEach((tier, index) => {
        const platforms = calculateDeckPlatforms(tier.length, tier.width);
        prompt += `Tier ${index + 1}: ${tier.length}' length × ${tier.width}' width × ${tier.height}' high
- Made of: ${platforms['4x8']} × 4'×8' platforms, ${platforms['4x4']} × 4'×4' platforms, ${platforms['4x2']} × 4'×2' platforms
${index === 0 ? "(Base tier on ground)" : `(Positioned on back of Tier ${index})`}
`;
      });

      const colorMap = {
        'natural_wood': 'natural wood finish',
        'black': 'black',
        'white': 'white',
        'gray': 'gray',
        'red': 'red',
        'blue': 'blue',
        'green': 'green',
        'yellow': 'yellow',
        'purple': 'purple',
        'orange': 'orange',
        'pink': 'pink'
      };

      prompt += `
STAGE DECK COLOR: ${colorMap[stageColor] || stageColor}

RAILINGS:
`;
      if (railings.back || railings.left || railings.right) {
        if (railings.back) prompt += "- Full-length railing on back edge\n";
        if (railings.left) prompt += "- Full-length railing on left side\n";
        if (railings.right) prompt += "- Full-length railing on right side\n";
        prompt += "- Front (audience facing) has NO railings\n";
      } else {
        prompt += "- NO railings\n";
      }

      if (currentRoof !== "none") {
        if (currentRoof === "marquee") {
          const tent = selectMarqueeTent(baseTierLength, baseTierWidth);
          const offsetFront = (baseTierLength - tent.length) / 2;
          const offsetSide = (baseTierWidth - tent.width) / 2;
          
          prompt += `
ROOF: ${tent.name} marquee tent (WHITE)
- Positioned on top of the stage with:
  - ${offsetFront}' offset from front and back of stage
  - ${offsetSide}' offset from left and right sides
- Supported by EXACTLY 4 corner legs (one at each corner: front-left, front-right, back-left, back-right)
- NO middle legs, NO side support legs, NO front middle leg
- Legs are positioned at the tent corners, touching the stage surface
`;
        } else if (currentRoof === "truss_frame") {
          const roofLength = baseTierLength - 2;
          const roofWidth = baseTierWidth - 2;
          prompt += `
ROOF: Truss frame roof structure (${roofLength}' × ${roofWidth}')
- Positioned centered on top of the stage
- Supported by EXACTLY 4 corner legs (one at each corner: front-left, front-right, back-left, back-right)
- NO middle legs, NO side support legs
- Legs are positioned at the corners, touching the stage surface
- Open space underneath the truss
`;
        } else if (currentRoof === "frame_tent") {
          const tentLength = baseTierLength - 2;
          const tentWidth = baseTierWidth - 2;
          prompt += `
ROOF: Frame tent roof (${tentLength}' × ${tentWidth}')
- Positioned centered on top of the stage
- Supported by EXACTLY 4 corner legs (one at each corner: front-left, front-right, back-left, back-right)
- NO middle legs, NO side support legs
- Legs are positioned at the corners, touching the stage surface
`;
        }
      }

      prompt += `
ORIENTATION & VIEW:
- Front of stage faces the viewer (the width dimension is what we see from front)
- Draw from a 35-degree angle showing depth
- Length extends back away from viewer
- Width extends left and right
- Height is vertical

CRITICAL REQUIREMENTS:
- NO STAIRS between tiers
- NO intermediate platforms
- Render EXACTLY the tiers specified above, no more, no less
- Use simple 3D technical drawing style
- Include grid or measurements for scale reference
- Show all deck platform seams clearly
- If railings present, show them as continuous bars
- Include shadows for depth perception
- Clean, professional technical drawing style`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      setSketchUrl(response.url);
      
      setTimeout(() => {
        sketchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating sketch:", error);
      alert("Error generating stage sketch. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const validTiers = validateTiers();
  const showRoofOptions = validTiers.length > 0 && sketchUrl;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-200px)]">
        {/* Left Side - Form (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 p-6 overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-white mb-4">Stage Design</h2>
          
          <div className="space-y-6">
            {tiers.map((tier, index) => (
              <div key={tier.id} className="bg-zinc-800/50 rounded-xl p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Tier {index + 1} {index === 0 && "(Base)"}
                  </h3>
                  {tiers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTier(tier.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-zinc-400 text-sm">Length (ft)</Label>
                    <Input
                      type="number"
                      value={tier.length}
                      onChange={(e) => updateTier(tier.id, 'length', e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                      placeholder="24"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm">Width (ft)</Label>
                    <Input
                      type="number"
                      value={tier.width}
                      onChange={(e) => updateTier(tier.id, 'width', e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                      placeholder="16"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm">Height (ft)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={tier.height}
                      onChange={(e) => updateTier(tier.id, 'height', e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                      placeholder="3"
                    />
                  </div>
                </div>

                {index > 0 && tier.length && tier.width && (
                  <p className="text-xs text-zinc-500 mt-2">
                    {parseFloat(tier.length) > parseFloat(tiers[index - 1].length) || 
                     parseFloat(tier.width) > parseFloat(tiers[index - 1].width) ? (
                      <span className="text-red-400">⚠️ This tier is too large for the previous tier</span>
                    ) : (
                      <span className="text-green-400">✓ This tier fits on the back of Tier {index}</span>
                    )}
                  </p>
                )}
              </div>
            ))}

            <Button
              onClick={addTier}
              variant="outline"
              className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-12 rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Tier
            </Button>
          </div>

          {/* Stage Color */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Stage Deck Color</h3>
            <Select value={stageColor} onValueChange={setStageColor}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="black" className="text-white">Black</SelectItem>
                <SelectItem value="white" className="text-white">White</SelectItem>
                <SelectItem value="gray" className="text-white">Gray</SelectItem>
                <SelectItem value="natural_wood" className="text-white">Natural Wood</SelectItem>
                <SelectItem value="red" className="text-white">Red</SelectItem>
                <SelectItem value="blue" className="text-white">Blue</SelectItem>
                <SelectItem value="green" className="text-white">Green</SelectItem>
                <SelectItem value="yellow" className="text-white">Yellow</SelectItem>
                <SelectItem value="purple" className="text-white">Purple</SelectItem>
                <SelectItem value="orange" className="text-white">Orange</SelectItem>
                <SelectItem value="pink" className="text-white">Pink</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Railings */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Railings</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="back-railing"
                  checked={railings.back}
                  onChange={(e) => setRailings({ ...railings, back: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="back-railing" className="text-zinc-300 cursor-pointer">
                  Back Railing
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="left-railing"
                  checked={railings.left}
                  onChange={(e) => setRailings({ ...railings, left: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="left-railing" className="text-zinc-300 cursor-pointer">
                  Left Railing
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="right-railing"
                  checked={railings.right}
                  onChange={(e) => setRailings({ ...railings, right: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="right-railing" className="text-zinc-300 cursor-pointer">
                  Right Railing
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateSketch}
            disabled={isGenerating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-11 rounded-lg mt-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Theater className="w-5 h-5 mr-2" />
                Generate Sketch
              </>
            )}
          </Button>

          {/* Roof Structure Options */}
          {showRoofOptions && (
            <div className="mt-6 pt-6 border-t border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-4">Roof Structure</h3>
              
              <div className="space-y-3">
                <Label className="text-zinc-400 text-sm">Select type</Label>
                <Select value={roofStructure} onValueChange={(value) => {
                  setRoofStructure(value);
                  handleGenerateSketch(value);
                }}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="none" className="text-white">No Roof</SelectItem>
                    <SelectItem value="marquee" className="text-white">Marquee Tent</SelectItem>
                    <SelectItem value="truss_frame" className="text-white">Truss Frame Roof</SelectItem>
                    <SelectItem value="frame_tent" className="text-white">Frame Tent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Side - Canvas (2/3) */}
        <div className="lg:col-span-2 bg-zinc-900/30 overflow-y-auto">
          {sketchUrl ? (
            <motion.div
              ref={sketchRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Theater className="w-6 h-6 text-amber-400" />
                Stage Design Sketch
              </h2>
              
              <div className="bg-black rounded-lg overflow-hidden mb-6">
                <img src={sketchUrl} alt="Stage design sketch" className="w-full h-auto" />
              </div>

              {/* Platform Summary */}
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h3>
                <div className="space-y-3">
                  {validTiers.map((tier, index) => {
                    const platforms = calculateDeckPlatforms(tier.length, tier.width);
                    return (
                      <div key={index} className="border-b border-zinc-700 pb-3 last:border-b-0">
                        <p className="text-amber-400 font-semibold mb-2">
                          Tier {index + 1}: {tier.length}' × {tier.width}' × {tier.height}' H
                        </p>
                        <div className="text-sm text-zinc-300 space-y-1">
                          {platforms['4x8'] > 0 && <p>• {platforms['4x8']} × 4'×8' platforms</p>}
                          {platforms['4x4'] > 0 && <p>• {platforms['4x4']} × 4'×4' platforms</p>}
                          {platforms['4x2'] > 0 && <p>• {platforms['4x2']} × 4'×2' platforms</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              <div className="text-center">
                <Theater className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Enter stage dimensions and click Generate Sketch</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}