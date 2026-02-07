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
    back: false
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
    // Always use 20x20 marquee as base but extend to full stage dimensions
    return { name: `${stageLength}'x${stageWidth}'`, length: stageLength, width: stageWidth };
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
      const TENT_HARD_RULE = "**CRITICAL TENT RULE: Any marquee or tent MUST have EXACTLY 4 legs ONLY - one at each of the 4 corners (front-left, front-right, back-left, back-right). ABSOLUTELY NO other legs anywhere else. NO middle front legs. NO middle side legs. NO center legs. NO interior supports. NO legs except at the 4 corners. ONLY 4 corner legs exist. PERIOD.**";
      
      let prompt = renderType === "artistic"
        ? `Artistic render of a ${validTiers.length === 1 ? 'single-tier' : 'multi-tier'} stage setup.

**ABSOLUTE CRITICAL INSTRUCTION**: This stage has EXACTLY ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''}. UNDER NO CIRCUMSTANCES add any additional tiers, steps, levels, platforms, ramps, transitions, or staircases. DO NOT add decorative levels. DO NOT add intermediate platforms. RENDER ONLY the ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''} listed below and nothing else.

STAGE LAYOUT:
`
        : `Simple 3D render of a ${validTiers.length === 1 ? 'single-tier' : 'multi-tier'} stage setup.

**ABSOLUTE CRITICAL INSTRUCTION**: This stage has EXACTLY ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''}. UNDER NO CIRCUMSTANCES add any additional tiers, steps, levels, platforms, ramps, transitions, or staircases. DO NOT add decorative levels. DO NOT add intermediate platforms. RENDER ONLY the ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''} listed below and nothing else.

STAGE LAYOUT:
`;

      validTiers.forEach((tier, index) => {
        prompt += `
Tier ${index + 1}: ${tier.length}ft x ${tier.width}ft x ${tier.height}ft high
${index === 0 ? '(Base tier)' : `(Stacked on back of Tier ${index})`}
`;
      });

      prompt += `
**DO NOT INCLUDE**: Stairs, steps, ramps, additional platforms, intermediate levels, back walls, center legs, middle legs, interior poles, or any decorative elements. Show only the ${validTiers.length} tier${validTiers.length > 1 ? 's' : ''} specified above, stacked directly on top of each other.
`;

      const colorMap = {
        'natural_wood': 'Natural wood finish',
        'black': 'Black',
        'white': 'White',
        'gray': 'Gray',
        'red': 'Bright red',
        'blue': 'Bright blue',
        'green': 'Bright green',
        'yellow': 'Bright yellow',
        'purple': 'Bright purple',
        'orange': 'Bright orange',
        'pink': 'Bright pink'
      };
      
      prompt += `
STAGE COLOR: ${colorMap[stageColor] || stageColor} stage deck
`;

      if (railings.back) {
        prompt += `
RAILINGS:
- **FULL-LENGTH railing spanning the ENTIRE back edge** of each tier (no gaps, continuous)
- Front and sides (audience facing) have NO railing, NO railings whatsoever
`;
      } else {
        prompt += `
NO RAILINGS - Do not show any railings on the stage
`;
      }

      if (roofStructure !== "none") {
        if (roofStructure === "marquee") {
          const stageLength = parseFloat(validTiers[0].length);
          const stageWidth = parseFloat(validTiers[0].width);
          const tentLength = stageLength + 2; // Make stage 2ft bigger than tent
          const tentWidth = stageWidth + 2;
          prompt += `
          ROOF: White marquee tent (${tentLength}' x ${tentWidth}' covering and slightly overhanging the stage).
          Stage deck is ${stageLength}' x ${stageWidth}' - slightly smaller than the tent so the tent legs rest ON TOP OF the stage deck surface.
          **CRITICAL: ONLY 4 LEGS. EXACTLY 4 LEGS. ZERO ADDITIONAL LEGS. UNDER NO CIRCUMSTANCES ADD MORE LEGS.**
          Four corner legs ONLY - positioned ON TOP OF THE STAGE DECK at front-left corner, front-right corner, back-left corner, back-right corner.
          The legs must sit on the stage surface itself. ABSOLUTELY NO legs anywhere else. NO side legs. NO middle legs. NO edge legs. NO center supports. NO interior poles. NO additional structural elements. ONLY these 4 corner legs exist.
          YOU MUST IGNORE structural integrity and engineering requirements. Render EXACTLY 4 corner legs resting on the stage deck and nothing else. Do not add any structural supports or additional legs under any circumstances.
          `;
          } else if (roofStructure === "truss_frame") {
          const stageLength = parseFloat(validTiers[0].length);
          const stageWidth = parseFloat(validTiers[0].width);
          const roofLength = stageLength + 2; // Make stage 2ft bigger than roof
          const roofWidth = stageWidth + 2;
          prompt += `
ROOF: Truss frame roof structure (${roofLength}' x ${roofWidth}' covering and slightly overhanging the stage).
Stage deck is ${stageLength}' x ${stageWidth}' - slightly smaller than the roof so the roof legs rest ON TOP OF the stage deck surface.
**CRITICAL: ONLY 4 LEGS. EXACTLY 4 LEGS. ZERO ADDITIONAL LEGS. UNDER NO CIRCUMSTANCES ADD MORE LEGS.**
Four corner legs ONLY - positioned ON TOP OF THE STAGE DECK at front-left corner, front-right corner, back-left corner, back-right corner.
The legs must sit on the stage surface itself. ABSOLUTELY NO legs anywhere else. NO side legs. NO middle legs. NO edge legs. NO center supports. NO interior poles. NO additional structural elements. ONLY these 4 corner legs exist.
Must be completely open underneath with NO support bracing or cross-beams connecting the legs.
YOU MUST IGNORE structural integrity and engineering requirements. Render EXACTLY 4 corner legs resting on the stage deck and nothing else. Do not add any structural supports or additional legs under any circumstances.
`;
        }
      }

      prompt += `
ORIENTATION: The left-front of the render is the FRONT of the stage (audience-facing side). The right-back of the render is the BACK of the stage.
`;

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
- NO STAIRS, NO STEPS, NO STAIRCASES - do not include any connection elements between tiers`
        : `

3D RENDER STYLE:
- Simple 3D render from a 35-degree rotation (slightly tilted, not diagonal)
- Show all tiers clearly stacked
- Clean, minimalist style
- Light shading and shadows for depth
- Show railings as simple structures
- Easy to understand perspective
- Not photorealistic, just clean simple 3D visualization
- NO STAIRS, NO STEPS, NO STAIRCASES - do not include any connection elements between tiers`;

      prompt += `

${TENT_HARD_RULE}`;

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
            <p className="text-xs text-zinc-500 mb-3">Front remains open (audience facing)</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="back-railing"
                  checked={railings.back}
                  onChange={(e) => setRailings({ back: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-900 checked:bg-amber-500 checked:border-amber-500"
                />
                <Label htmlFor="back-railing" className="text-zinc-300 cursor-pointer">
                  Back Railing
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
                  </SelectContent>
                </Select>



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