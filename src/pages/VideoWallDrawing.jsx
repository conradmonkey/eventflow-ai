import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MonitorPlay, Loader2, MapPin, Ruler, Sparkles, FileText, Box } from "lucide-react";
import { motion } from "framer-motion";

export default function VideoWallDrawing() {
  const [formData, setFormData] = useState({
    country: "",
    province: "",
    city: "",
    wall_height: "",
    wall_width: "",
    height_off_ground: "",
    mounting_type: "", // "box", "stage", or "truss"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [drawingUrl, setDrawingUrl] = useState(null);
  const [gearList, setGearList] = useState(null);
  const [isGeneratingGear, setIsGeneratingGear] = useState(false);
  const [renderUrl, setRenderUrl] = useState(null);
  const [isGeneratingRender, setIsGeneratingRender] = useState(false);

  const heightOffGroundInFeet = formData.height_off_ground ? parseFloat(formData.height_off_ground) * 3.28084 : 0;
  const showMountingOptions = heightOffGroundInFeet >= 2;

  const calculateGearList = () => {
    const height = parseFloat(formData.wall_height);
    const width = parseFloat(formData.wall_width);
    const heightOffGround = parseFloat(formData.height_off_ground);
    
    // Video wall panels (1m x 0.5m each)
    const panelsHigh = Math.ceil(height / 1);
    const panelsWide = Math.ceil(width / 0.5);
    const totalPanels = panelsHigh * panelsWide;
    const panelCost = totalPanels * 100;

    let stageDeckCount = 0;
    let stageDeckCost = 0;
    let boxCount = 0;
    let boxCost = 0;
    let trussCount = 0;
    let riggingItems = [];

    const heightOffGroundFt = heightOffGround * 3.28084;

    if (heightOffGroundFt < 2) {
      // Black box mounting
      boxCount = 1;
      boxCost = 150; // Estimated cost for custom box
    } else if (formData.mounting_type === "stage") {
      // Calculate stage decks needed
      const stageWidthFt = 4;
      const stageLengthNeededFt = width * 3.28084;
      
      // Use 4x8 and 4x4 decks
      let length4x8 = 0;
      let length4x4 = 0;
      
      if (stageLengthNeededFt <= 8) {
        length4x8 = 1;
      } else {
        length4x8 = 1;
        const remaining = stageLengthNeededFt - 8;
        length4x4 = Math.ceil(remaining / 4);
      }
      
      stageDeckCount = length4x8 + length4x4;
      stageDeckCost = stageDeckCount * 100;
    } else if (formData.mounting_type === "truss") {
      // Calculate truss lengths
      const trussWidth = (width + 0.6) * 3.28084; // +1ft each side
      const trussHeight = (height + 0.3) * 3.28084; // +1ft top
      
      // Truss segments (12" box truss, typically 10ft sections)
      const topBottomSegments = Math.ceil(trussWidth / 10) * 2; // top and bottom
      const sideSegments = Math.ceil(trussHeight / 10) * 2; // left and right
      trussCount = topBottomSegments + sideSegments + 4; // +4 for legs
      
      riggingItems = [
        "Chain motors (4x)",
        "Slings and eyebolts (12x)",
        "Outriggers (4x)",
        "Truss clamps and hardware"
      ];
    }

    return {
      videoPanels: { count: totalPanels, dimensions: `${panelsHigh} high x ${panelsWide} wide`, cost: panelCost },
      stageDecks: stageDeckCount > 0 ? { count: stageDeckCount, cost: stageDeckCost } : null,
      box: boxCount > 0 ? { count: boxCount, cost: boxCost } : null,
      truss: trussCount > 0 ? { segments: trussCount, cost: trussCount * 75 } : null,
      rigging: riggingItems.length > 0 ? riggingItems : null,
      totalCost: panelCost + stageDeckCost + boxCost + (trussCount * 75) + (riggingItems.length > 0 ? 500 : 0)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDrawingUrl(null);
    setGearList(null);

    try {
      const height = parseFloat(formData.wall_height);
      const width = parseFloat(formData.wall_width);
      const heightOffGround = parseFloat(formData.height_off_ground);
      const heightOffGroundFt = heightOffGround * 3.28084;

      let setupDescription = `Video Wall Setup Technical Drawing:

Location: ${formData.city}, ${formData.province}, ${formData.country}

Video Wall Specifications:
- Screen dimensions: ${width}m wide x ${height}m tall
- Bottom of screen height: ${heightOffGround}m (${heightOffGroundFt.toFixed(1)}ft) off ground

`;

      if (heightOffGroundFt < 2) {
        const boxWidth = width + 0.6; // +1ft (0.3m) each side
        setupDescription += `Mounting: Black support box under video wall
- Box dimensions: ${boxWidth.toFixed(2)}m long x 0.3m wide x ${heightOffGround <= 0.3 ? '0.3' : '0.6'}m tall
- Video wall rests on top of box
`;
      } else if (formData.mounting_type === "stage") {
        setupDescription += `Mounting: Stage platform
- Stage: 1.2m (4ft) wide, minimum ${width}m long
- Built with 4x8ft and 4x4ft stage deck platforms
- Maximum one 4x8ft deck, remaining length with 4x4ft decks
- Stage height: ${heightOffGround}m
- Video wall rests on stage
`;
      } else if (formData.mounting_type === "truss") {
        const trussWidth = width + 0.6;
        const trussHeight = height + 0.3;
        const slingCount = Math.ceil(width / 0.6) + 1; // Every 2ft (0.6m)
        setupDescription += `Mounting: Suspended from truss
- 12-inch box truss frame around video wall
- Truss dimensions: ${trussWidth.toFixed(2)}m wide x ${trussHeight.toFixed(2)}m tall
- Video wall hangs 1ft (0.3m) below the bottom of the top horizontal truss bar
- Approximately 1ft (0.3m) clearance between video wall sides and vertical truss bars
- Suspended using ${slingCount} slings spaced every 2ft (0.6m) along the width
- Slings attach to eyebolts on a bumper bar mounted on top of the video wall
- Four truss legs with outriggers for support
`;
      }

      setupDescription += `
Important: Video wall is built from LED panels that are 1m high × 0.5m wide each.

Draw this as a visual side-view diagram showing:
- The video wall as a large flat rectangle (NO legs on the video wall itself)
- All structural support (box/stage/truss) with clear proportions
${formData.mounting_type === "truss" ? "- Slings hanging from the top truss bar down to the bumper on top of the video wall (1ft gap between truss bottom and video wall top)\n- Show the slings clearly as lines connecting the truss to the video wall\n" : ""}
- A 5'10" (1.78m) tall woman silhouette standing next to the setup for scale reference
- Key measurements labeled
- Ground level reference line
- Clean visual style with clear shapes and colors
- Easy to understand visual representation`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt: setupDescription
      });

      setDrawingUrl(response.url);
    } catch (error) {
      console.error("Error generating drawing:", error);
      alert("An error occurred while generating the drawing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGearList = () => {
    setIsGeneratingGear(true);
    setTimeout(() => {
      setGearList(calculateGearList());
      setIsGeneratingGear(false);
    }, 500);
  };

  const handleGenerate3DRender = async () => {
    setIsGeneratingRender(true);
    setRenderUrl(null);

    try {
      const height = parseFloat(formData.wall_height);
      const width = parseFloat(formData.wall_width);
      const heightOffGround = parseFloat(formData.height_off_ground);
      const heightOffGroundFt = heightOffGround * 3.28084;

      let renderPrompt = `Ultra realistic, cinematic 3D render of a stunning LED video wall display setup. 

Video Wall:
- Massive LED screen: ${width}m wide × ${height}m tall
- Displaying vibrant, dynamic content with brilliant colors
- Professional grade LED panels with seamless edges
- Modern, sleek black bezels
- Bottom of screen is ${heightOffGround}m off the ground

`;

      if (heightOffGroundFt < 2) {
        renderPrompt += `- Mounted on a modern black support structure
- Clean, minimalist design
`;
      } else if (formData.mounting_type === "stage") {
        renderPrompt += `- Positioned on a professional stage platform
- Industrial stage deck construction
- Stage is ${heightOffGround}m high
`;
      } else if (formData.mounting_type === "truss") {
        renderPrompt += `- Suspended from professional rigging system
- Truss structure completely hidden behind elegant black drape fabric
- Clean, theatrical presentation with no visible rigging
- Glamorous, polished look
`;
      }

      renderPrompt += `
Environment:
- Dark, atmospheric venue setting with subtle ambient lighting
- Cinematic lighting highlighting the video wall
- Professional event production atmosphere
- High-end, luxury aesthetic
- Dramatic shadows and highlights
- Premium, glamorous look

Style:
- Photorealistic 3D rendering
- Cinematic camera angle
- High contrast, dramatic lighting
- Professional event production quality
- Ultra high resolution details
- Glamorous and impressive presentation`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt: renderPrompt
      });

      setRenderUrl(response.url);
    } catch (error) {
      console.error("Error generating 3D render:", error);
      alert("An error occurred while generating the 3D render. Please try again.");
    } finally {
      setIsGeneratingRender(false);
    }
  };

  const handleReset = () => {
    setFormData({
      country: "",
      province: "",
      city: "",
      wall_height: "",
      wall_width: "",
      height_off_ground: "",
      mounting_type: "",
    });
    setDrawingUrl(null);
    setGearList(null);
    setRenderUrl(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <MonitorPlay className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Video Wall Setup Drawing Generator</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Generate technical drawings and equipment lists for your LED video wall installation
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                LOCATION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Country</Label>
                  <Input
                    required
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Canada"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Province / State</Label>
                  <Input
                    required
                    value={formData.province}
                    onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Ontario"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">City</Label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Toronto"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-cyan-400" />
                VIDEO WALL DIMENSIONS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Screen Height (metres)</Label>
                  <Select
                    value={formData.wall_height}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, wall_height: value }))}
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="text-white">
                          {h}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">Screen Width (metres)</Label>
                  <Select
                    value={formData.wall_width}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, wall_width: value }))}
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12].map((w) => (
                        <SelectItem key={w} value={w.toString()} className="text-white">
                          {w}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">Height Off Ground (metres)</Label>
                  <Select
                    value={formData.height_off_ground}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, height_off_ground: value, mounting_type: "" }));
                    }}
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="text-white">
                          {h}m ({(h * 3.28084).toFixed(1)}ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mounting Type (only if >= 2ft) */}
            {showMountingOptions && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">MOUNTING TYPE</h2>
                <RadioGroup
                  value={formData.mounting_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, mounting_type: value }))}
                  required
                >
                  <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                    <RadioGroupItem value="stage" id="stage" className="border-zinc-600 text-cyan-400" />
                    <Label htmlFor="stage" className="text-white cursor-pointer flex-1">
                      <div className="font-semibold">On Stage Platform</div>
                      <div className="text-sm text-zinc-400">Video wall rests on stage decks</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                    <RadioGroupItem value="truss" id="truss" className="border-zinc-600 text-cyan-400" />
                    <Label htmlFor="truss" className="text-white cursor-pointer flex-1">
                      <div className="font-semibold">Suspended from Truss</div>
                      <div className="text-sm text-zinc-400">Video wall hangs from rigging truss</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading || (showMountingOptions && !formData.mounting_type)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold h-12 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Drawing
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white h-12 rounded-lg px-6"
              >
                Reset
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Drawing Result */}
        {drawingUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MonitorPlay className="w-6 h-6 text-cyan-400" />
              Technical Drawing
            </h2>
            <div className="bg-white rounded-lg p-4">
              <img src={drawingUrl} alt="Video wall setup drawing" className="w-full h-auto" />
            </div>

            <div className="flex gap-3 mt-6">
              {!gearList && (
                <Button
                  onClick={handleGenerateGearList}
                  disabled={isGeneratingGear}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 rounded-lg"
                >
                  {isGeneratingGear ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <FileText className="w-5 h-5 mr-2" />
                  )}
                  Generate Equipment List
                </Button>
              )}
              
              <Button
                onClick={handleGenerate3DRender}
                disabled={isGeneratingRender}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12 rounded-lg"
              >
                {isGeneratingRender ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Box className="w-5 h-5 mr-2" />
                )}
                Generate 3D Render
              </Button>
            </div>
          </motion.div>
        )}

        {/* 3D Render */}
        {renderUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Box className="w-6 h-6 text-purple-400" />
              3D Render
            </h2>
            <div className="bg-black rounded-lg overflow-hidden">
              <img src={renderUrl} alt="3D render of video wall setup" className="w-full h-auto" />
            </div>
          </motion.div>
        )}

        {/* Gear List */}
        {gearList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-400" />
              Equipment List & Costs
            </h2>

            <div className="space-y-6">
              {/* Video Panels */}
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">LED Video Wall Panels</h3>
                <div className="text-zinc-300 space-y-1">
                  <p>Panel size: 1m × 0.5m</p>
                  <p>Configuration: {gearList.videoPanels.dimensions}</p>
                  <p className="text-cyan-400 font-semibold">
                    Quantity: {gearList.videoPanels.count} panels
                  </p>
                  <p className="text-amber-400 font-semibold">
                    Cost: ${gearList.videoPanels.cost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stage Decks */}
              {gearList.stageDecks && (
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Stage Decks</h3>
                  <div className="text-zinc-300 space-y-1">
                    <p>4ft × 8ft and 4ft × 4ft platforms</p>
                    <p className="text-cyan-400 font-semibold">
                      Quantity: {gearList.stageDecks.count} decks
                    </p>
                    <p className="text-amber-400 font-semibold">
                      Cost: ${gearList.stageDecks.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Support Box */}
              {gearList.box && (
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Support Box</h3>
                  <div className="text-zinc-300 space-y-1">
                    <p>Custom black support structure</p>
                    <p className="text-amber-400 font-semibold">
                      Cost: ${gearList.box.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Truss */}
              {gearList.truss && (
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">12" Box Truss System</h3>
                  <div className="text-zinc-300 space-y-1">
                    <p className="text-cyan-400 font-semibold">
                      Segments: {gearList.truss.segments} (10ft sections)
                    </p>
                    <p className="text-amber-400 font-semibold">
                      Cost: ${gearList.truss.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Rigging */}
              {gearList.rigging && (
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Rigging Equipment</h3>
                  <ul className="text-zinc-300 space-y-2">
                    {gearList.rigging.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-amber-400 font-semibold mt-3">
                    Estimated Cost: $500
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-amber-500/20 to-cyan-500/20 rounded-lg p-6 border border-amber-500/30">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Total Estimated Cost</h3>
                  <p className="text-3xl font-bold text-amber-400">
                    ${gearList.totalCost.toLocaleString()}
                  </p>
                </div>
                <p className="text-zinc-400 text-sm mt-2">
                  *Prices are estimates and may vary based on supplier and location
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}