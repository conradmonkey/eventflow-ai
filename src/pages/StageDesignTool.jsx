import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
    const sizes = [
      { name: "30'x30'", length: 30, width: 30 },
      { name: "10'x30'", length: 30, width: 10 },
      { name: "10'x20'", length: 20, width: 10 },
      { name: "10'x10'", length: 10, width: 10 }
    ];

    for (const size of sizes) {
      if (size.length <= stageLength && size.width <= stageWidth) {
        return size;
      }
    }
    return null;
  };

  const handleGenerateSketch = async () => {
    setIsGenerating(true);
    setSketchUrl(null);

    try {
      const validTiers = validateTiers();
      
      if (validTiers.length === 0) {
        alert("Please enter valid dimensions for at least one tier.");
        setIsGenerating(false);
        return;
      }

      // Build detailed prompt
      let prompt = `Technical architectural sketch of a multi-tier stage design, side view and top-down view.

STAGE SPECIFICATIONS:
`;

      validTiers.forEach((tier, index) => {
        const platforms = calculateDeckPlatforms(tier.length, tier.width);
        prompt += `
Tier ${index + 1}:
- Dimensions: ${tier.length}ft (L) x ${tier.width}ft (W) x ${tier.height}ft (H)
- Platform composition: ${platforms['4x8']} units of 4'x8' deck platforms, ${platforms['4x4']} units of 4'x4' platforms, ${platforms['4x2']} units of 4'x2' platforms
- Position: ${index === 0 ? 'Base tier' : `Centered on back edge of Tier ${index}, aligned to rear`}
`;
      });

      const firstTier = validTiers[0];
      if (parseFloat(firstTier.height) > 1) {
        prompt += `
- Stairs: Located on the left side of the stage, providing access from ground to tier 1
`;
      }

      if (railings.back || railings.left || railings.right) {
        prompt += `
RAILINGS:
`;
        if (railings.back) prompt += `- Back railing: Full length across the back edge of the top tier\n`;
        if (railings.left) prompt += `- Left side railing: Full length along the left side, NOT blocking stairs\n`;
        if (railings.right) prompt += `- Right side railing: Full length along the right side\n`;
      }

      if (roofStructure !== "none") {
        if (roofStructure === "marquee") {
          const tent = selectMarqueeTent(parseFloat(firstTier.length), parseFloat(firstTier.width));
          if (tent) {
            const offsetLength = (parseFloat(firstTier.length) - tent.length) / 2;
            const offsetWidth = (parseFloat(firstTier.width) - tent.width) / 2;
            prompt += `
ROOF STRUCTURE:
- Type: Marquee Canopy Tent (${tent.name})
- Position: Centered on top of the base tier, ${offsetLength}ft from front/back edges, ${offsetWidth}ft from left/right edges
`;
          }
        } else if (roofStructure === "truss_frame") {
          prompt += `
ROOF STRUCTURE:
- Type: Truss Frame Roof
- Dimensions: Slightly smaller than base tier to fit on top
- Professional aluminum truss construction with overhead rigging points
`;
        } else if (roofStructure === "frame_tent") {
          prompt += `
ROOF STRUCTURE:
- Type: Frame Tent
- Dimensions: Fitted to cover the entire base tier
- Traditional tent frame with fabric canopy
`;
        }
      }

      prompt += `

DRAWING REQUIREMENTS:
- Create TWO views: side elevation view AND top-down floor plan view
- Side view: Show all tiers stacked vertically with clear height measurements, include stairs if applicable, show deck platform layers
- Top view: Show the footprint of each tier, deck platform grid layout (4'x8', 4'x4', 4'x2' visible), railing positions, roof structure outline
- Professional architectural sketch style with clean lines
- Include dimension labels and measurements
- Show material specifications for platforms
- Technical blueprint aesthetic with precise proportions
- Black and white line drawing style
- Grid background for scale reference`;

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
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Theater className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Stage Design Assistant</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Design multi-tier stages with optimized deck platforms, railings, and roof structures
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Stage Tiers</h2>
          
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

          {/* Railings */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Railings</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="back-railing"
                  checked={railings.back}
                  onCheckedChange={(checked) => setRailings({ ...railings, back: checked })}
                  className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Label htmlFor="back-railing" className="text-zinc-300 cursor-pointer">
                  Back Railing (full length across back)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="left-railing"
                  checked={railings.left}
                  onCheckedChange={(checked) => setRailings({ ...railings, left: checked })}
                  className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Label htmlFor="left-railing" className="text-zinc-300 cursor-pointer">
                  Left Side Railing (won't block stairs)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="right-railing"
                  checked={railings.right}
                  onCheckedChange={(checked) => setRailings({ ...railings, right: checked })}
                  className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                />
                <Label htmlFor="right-railing" className="text-zinc-300 cursor-pointer">
                  Right Side Railing (full length)
                </Label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateSketch}
            disabled={isGenerating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-lg mt-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Stage Design...
              </>
            ) : (
              <>
                <Theater className="w-5 h-5 mr-2" />
                Generate Stage Sketch
              </>
            )}
          </Button>
        </motion.div>

        {/* Roof Structure Options */}
        {showRoofOptions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Roof Structure (Optional)</h2>
            
            <div className="space-y-4">
              <Label className="text-zinc-400">Select roof structure type</Label>
              <Select value={roofStructure} onValueChange={setRoofStructure}>
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="none" className="text-white">No Roof Structure</SelectItem>
                  <SelectItem value="marquee" className="text-white">Marquee Canopy Tent</SelectItem>
                  <SelectItem value="truss_frame" className="text-white">Truss Frame Roof</SelectItem>
                  <SelectItem value="frame_tent" className="text-white">Frame Tent</SelectItem>
                </SelectContent>
              </Select>

              {roofStructure === "marquee" && validTiers.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 text-sm text-zinc-300">
                  <p className="font-semibold text-white mb-2">Marquee Tent Sizing:</p>
                  <p>Available sizes: 10'x10', 10'x20', 10'x30', 30'x30'</p>
                  <p className="mt-2">
                    {(() => {
                      const tent = selectMarqueeTent(
                        parseFloat(validTiers[0].length), 
                        parseFloat(validTiers[0].width)
                      );
                      return tent 
                        ? `✓ Selected: ${tent.name} (fits on your ${validTiers[0].length}' x ${validTiers[0].width}' stage)`
                        : '⚠️ No marquee tent size fits this stage';
                    })()}
                  </p>
                </div>
              )}

              <Button
                onClick={handleGenerateSketch}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-12 rounded-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Regenerating with Roof...
                  </>
                ) : (
                  <>
                    <Box className="w-5 h-5 mr-2" />
                    Regenerate with Roof Structure
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Generated Sketch */}
        {sketchUrl && (
          <motion.div
            ref={sketchRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
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

              {parseFloat(validTiers[0].height) > 1 && (
                <p className="text-zinc-400 text-sm mt-4">
                  • Stairs required on left side (stage height {'>'} 1 ft)
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}