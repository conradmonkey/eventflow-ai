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
    left_back: false,
    right_back: false,
    right_front: false
  });
  const [roofStructure, setRoofStructure] = useState("none");
  const [renderType, setRenderType] = useState("3d");
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
    let remainingLength = lengthFt;
    let remainingWidth = widthFt;

    // Maximize 4x8 platforms
    const num4x8Length = Math.floor(remainingLength / 8);
    const num4x8Width = Math.floor(remainingWidth / 4);
    platforms['4x8'] = num4x8Length * num4x8Width;
    remainingLength = lengthFt % 8;

    // Then 4x4 platforms
    if (remainingLength >= 4) {
      const num4x4 = Math.floor(remainingWidth / 4);
      platforms['4x4'] += num4x4;
      remainingLength -= 4;
    }

    const num4x4Width = Math.floor(remainingWidth / 4);
    if (num4x4Width > 0 && remainingLength > 0 && remainingLength < 4) {
      const num4x2 = Math.floor(remainingLength / 2) * num4x4Width;
      platforms['4x2'] = num4x2;
    }

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
        // Check if current tier fits on previous tier
        if (length <= prevTier.length && width <= prevTier.width) {
          validTiers.push({ ...tier, length, width, height });
          prevTier = { length, width, height };
        }
      }
    }

    return validTiers;
  };

  const selectMarqueeTent = (stageLength, stageWidth) => {
    // Scale tent to match stage dimensions (slightly smaller for visual margin)
    const tentLength = Math.max(10, Math.round(stageLength * 0.95 / 5) * 5);
    const tentWidth = Math.max(10, Math.round(stageWidth * 0.95 / 5) * 5);
    return { name: `${tentLength}'x${tentWidth}'`, length: tentLength, width: tentWidth };
  };

  const handleGenerateSketch = async () => {
    setIsGenerating(true);

    try {
      const validTiers = validateTiers();
      
      if (validTiers.length === 0) {
        alert("Please enter valid dimensions for at least one tier.");
        setIsGenerating(false);
        return;
      }
      
      setSketchUrl(null);

      // Build detailed prompt
      let prompt = renderType === "artistic"
        ? `Artistic render of a ${validTiers.length === 1 ? 'single-tier' : 'multi-tier'} stage setup.

CRITICAL INSTRUCTION - TIER COUNT: This stage has EXACTLY ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''}. DO NOT add any extra tiers, steps, or levels. DO NOT create additional platforms beyond the ${validTiers.length} specified below. Show ONLY the tiers listed.

STAGE LAYOUT:
`
        : `Simple 3D render of a ${validTiers.length === 1 ? 'single-tier' : 'multi-tier'} stage setup.

CRITICAL INSTRUCTION - TIER COUNT: This stage has EXACTLY ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''}. DO NOT add any extra tiers, steps, or levels. DO NOT create additional platforms beyond the ${validTiers.length} specified below. Show ONLY the tiers listed.

STAGE LAYOUT:
`;

      validTiers.forEach((tier, index) => {
        prompt += `
Tier ${index + 1}: ${tier.length}ft x ${tier.width}ft x ${tier.height}ft high
${index === 0 ? '(Base tier)' : `(On back of Tier ${index})`}
`;
      });

      prompt += `
ABSOLUTE REQUIREMENT: There are ONLY ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''} on this stage. NO STAIRS, NO STEPS, NO RAMPS, NO ADDITIONAL PLATFORMS, NO EXTRA LEVELS, NO TRANSITIONAL ELEMENTS. Render ONLY what is listed above, nothing more. Tiers stack directly on top of each other.
`;

      prompt += `
STAGE COLOR: ${stageColor === 'natural_wood' ? 'Natural wood finish' : stageColor.charAt(0).toUpperCase() + stageColor.slice(1)} stage deck
`;



      if (railings.left_back || railings.right_back || railings.right_front) {
        prompt += `
RAILINGS:
`;
        if (railings.left_back) prompt += `- Left back corner\n`;
        if (railings.right_back) prompt += `- Right back corner\n`;
        if (railings.right_front) prompt += `- Right front area\n`;
        prompt += `- The LEFT SIDE (front of stage) MUST remain completely open with NO railings\n`;
      } else {
        prompt += `
NO RAILINGS - Do not show any railings on the stage
`;
      }

      if (roofStructure !== "none") {
        if (roofStructure === "marquee") {
          const tent = selectMarqueeTent(parseFloat(validTiers[0].length), parseFloat(validTiers[0].width));
          if (tent) {
            prompt += `
ROOF: White marquee tent (${tent.name}) on base tier - NO center support legs or poles
`;
          }
        } else if (roofStructure === "truss_frame") {
          prompt += `
ROOF: Truss frame roof structure
`;
        } else if (roofStructure === "frame_tent") {
          prompt += `
ROOF: White frame tent covering base tier
`;
        }
      }

      prompt += renderType === "artistic"
        ? `

ARTISTIC RENDER STYLE:
- Beautiful, artistic visualization of the stage
- Photorealistic rendering with proper lighting
- Dramatic angle showcasing the stage design (rotated 30-40 degrees from front, not diagonal)
- High-quality textures for wood decking
- Professional event lighting atmosphere
- Show all structural elements beautifully
- Inspiring and visually appealing
- Production-quality render
- NO STAIRS OR STAIRCASES - do not include any stairs`
        : `

3D RENDER STYLE:
- Simple 3D render from a 35-degree rotation (slightly tilted, not diagonal)
- Show all tiers clearly stacked
- Clean, minimalist style
- Light shading and shadows for depth
- Show railings as simple structures
- Easy to understand perspective
- Not photorealistic, just clean simple 3D visualization
- NO STAIRS OR STAIRCASES - do not include any stairs`;

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Theater className="w-6 h-6 text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">AI Stage Design Assistant</h1>
        <p className="text-zinc-400">
          Design multi-tier stages with optimized deck platforms, railings, and roof structures
        </p>
      </motion.div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-200px)]">
        {/* Left Side - Form (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 p-6 overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-white mb-4">Stage Tiers</h2>
          
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
                      <span className="text-red-400">⚠️ This tier is too large for the previous tier and will not be included</span>
                    ) : (
                      <span className="text-green-400">✓ This tier will be centered on the back of Tier {index}</span>
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

          {/* Render Type */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Render Type</h3>
            <Select value={renderType} onValueChange={setRenderType}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="3d" className="text-white">Simple 3D Render</SelectItem>
                <SelectItem value="artistic" className="text-white">Artistic Render</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stage Color */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Stage Color</h3>
            <Select value={stageColor} onValueChange={setStageColor}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="black" className="text-white">Black</SelectItem>
                <SelectItem value="gray" className="text-white">Gray</SelectItem>
                <SelectItem value="natural_wood" className="text-white">Natural Wood</SelectItem>
                <SelectItem value="white" className="text-white">White</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Railings */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Railings</h3>
            <p className="text-xs text-zinc-500 mb-3">Front of stage (left side) always remains open</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="left-back-railing"
                  checked={railings.left_back}
                  onChange={(e) => setRailings({ ...railings, left_back: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="left-back-railing" className="text-zinc-300 cursor-pointer">
                  Left Back
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="right-back-railing"
                  checked={railings.right_back}
                  onChange={(e) => setRailings({ ...railings, right_back: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="right-back-railing" className="text-zinc-300 cursor-pointer">
                  Right Back
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="right-front-railing"
                  checked={railings.right_front}
                  onChange={(e) => setRailings({ ...railings, right_front: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="right-front-railing" className="text-zinc-300 cursor-pointer">
                  Right Front
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
                <Select value={roofStructure} onValueChange={setRoofStructure}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="none" className="text-white">No Roof</SelectItem>
                    <SelectItem value="marquee" className="text-white">Marquee Tent</SelectItem>
                    <SelectItem value="truss_frame" className="text-white">Truss Frame</SelectItem>
                    <SelectItem value="frame_tent" className="text-white">Frame Tent</SelectItem>
                  </SelectContent>
                </Select>

                {roofStructure === "marquee" && validTiers.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-300">
                    <p className="font-semibold text-white mb-1">Marquee Sizing:</p>
                    <p>Sizes: 10'x10', 10'x20', 10'x30', 20'x20', 30'x30'</p>
                    <p className="mt-1">
                      {(() => {
                        const tent = selectMarqueeTent(
                          parseFloat(validTiers[0].length), 
                          parseFloat(validTiers[0].width)
                        );
                        return tent 
                          ? `✓ ${tent.name}`
                          : '⚠️ No fit';
                      })()}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerateSketch}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-11 rounded-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Box className="w-4 h-4 mr-2" />
                      Add Roof
                    </>
                  )}
                </Button>
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
                <h3 className="text-lg font-semibold text-white mb-4">Deck Platform Summary</h3>
                <div className="space-y-3">
                  {validTiers.map((tier, index) => {
                    const platforms = calculateDeckPlatforms(tier.length, tier.width);
                    return (
                      <div key={index} className="border-b border-zinc-700 pb-3 last:border-b-0">
                        <p className="text-amber-400 font-semibold mb-2">
                          Tier {index + 1}: {tier.length}' x {tier.width}' x {tier.height}' H
                        </p>
                        <div className="text-sm text-zinc-300 space-y-1">
                          {platforms['4x8'] > 0 && <p>• {platforms['4x8']} x 4'×8' deck platforms</p>}
                          {platforms['4x4'] > 0 && <p>• {platforms['4x4']} x 4'×4' deck platforms</p>}
                          {platforms['4x2'] > 0 && <p>• {platforms['4x2']} x 4'×2' deck platforms</p>}
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
                <p className="text-lg">Enter stage details and click Generate Sketch</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}