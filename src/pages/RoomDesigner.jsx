import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Ruler, Sparkles, Loader2, Layout, Box } from "lucide-react";
import { motion } from "framer-motion";

export default function RoomDesigner() {
  const [formData, setFormData] = useState({
    project_name: "",
    country: "",
    province: "",
    city: "",
    room_length: "",
    room_width: "",
    stage_length: "",
    stage_width: "",
    dance_floor_length: "",
    dance_floor_width: "",
    bar_length: "",
    bar_width: "",
    video_wall_height: "",
    video_wall_width: "",
    table_8ft: "0",
    table_6ft: "0",
    table_5ft_round: "0",
    table_6ft_round: "0",
    cocktail_tables: "0",
    table_color: "white",
  });

  const [isLoading2D, setIsLoading2D] = useState(false);
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [layout2D, setLayout2D] = useState(null);
  const [render3D, setRender3D] = useState(null);
  const [gearList, setGearList] = useState(null);

  const calculateGearList = () => {
    const roomArea = parseFloat(formData.room_length || 0) * parseFloat(formData.room_width || 0);
    const stageArea = parseFloat(formData.stage_length || 0) * parseFloat(formData.stage_width || 0);
    const danceFloorArea = parseFloat(formData.dance_floor_length || 0) * parseFloat(formData.dance_floor_width || 0);
    const videoWallArea = (parseFloat(formData.video_wall_height || 0) * 3.28084) * (parseFloat(formData.video_wall_width || 0) * 3.28084); // Convert m to ft
    const videoWallAreaM2 = parseFloat(formData.video_wall_height || 0) * parseFloat(formData.video_wall_width || 0);

    const table8ftCount = parseInt(formData.table_8ft || 0);
    const table6ftCount = parseInt(formData.table_6ft || 0);
    const table5ftRoundCount = parseInt(formData.table_5ft_round || 0);
    const table6ftRoundCount = parseInt(formData.table_6ft_round || 0);
    const cocktailTableCount = parseInt(formData.cocktail_tables || 0);

    const totalTables = table8ftCount + table6ftCount + table5ftRoundCount + table6ftRoundCount + cocktailTableCount;

    const costs = {
      tables_8ft: { count: table8ftCount, unitCost: 10, total: table8ftCount * 10 },
      tables_6ft: { count: table6ftCount, unitCost: 10, total: table6ftCount * 10 },
      tables_5ft_round: { count: table5ftRoundCount, unitCost: 18, total: table5ftRoundCount * 18 },
      tables_6ft_round: { count: table6ftRoundCount, unitCost: 18, total: table6ftRoundCount * 18 },
      cocktail_tables: { count: cocktailTableCount, unitCost: 10, total: cocktailTableCount * 10 },
      table_linen: { count: totalTables, unitCost: 27, total: totalTables * 27 },
      stage: { area: stageArea, unitCost: 5, total: stageArea * 5 },
      dance_floor: { area: danceFloorArea, unitCost: 3.5, total: danceFloorArea * 3.5 },
      video_wall: { area: videoWallAreaM2, unitCost: 200, total: videoWallAreaM2 * 200 },
    };

    const totalCost = Object.values(costs).reduce((sum, item) => sum + (item.total || 0), 0);

    return { costs, totalCost };
  };

  const handleGenerate2D = async (e) => {
    e.preventDefault();
    setIsLoading2D(true);
    setLayout2D(null);
    setGearList(null);

    try {
      const gear = calculateGearList();
      setGearList(gear);

      const prompt = `Create a professional 2D floor plan layout drawing for an elegant event space.

Location: ${formData.city}, ${formData.province}, ${formData.country}

Room: ${formData.room_length}ft x ${formData.room_width}ft

CRITICAL: Include EXACTLY these elements (no more, no less):
${formData.stage_length && formData.stage_width ? `- Stage: ${formData.stage_length}ft x ${formData.stage_width}ft` : ''}
${formData.dance_floor_length && formData.dance_floor_width ? `- Dance Floor: ${formData.dance_floor_length}ft x ${formData.dance_floor_width}ft` : ''}
${formData.bar_length && formData.bar_width ? `- Bar: ${formData.bar_length}ft x ${formData.bar_width}ft` : ''}
${formData.video_wall_height && formData.video_wall_width ? `- Video Wall: ${formData.video_wall_height}m x ${formData.video_wall_width}m` : ''}
${formData.table_8ft !== "0" ? `- EXACTLY ${formData.table_8ft} (${formData.table_8ft}) 8ft Banquet Tables (rectangular)` : ''}
${formData.table_6ft !== "0" ? `- EXACTLY ${formData.table_6ft} (${formData.table_6ft}) 6ft Banquet Tables (rectangular)` : ''}
${formData.table_5ft_round !== "0" ? `- EXACTLY ${formData.table_5ft_round} (${formData.table_5ft_round}) 5ft Round Tables (circles)` : ''}
${formData.table_6ft_round !== "0" ? `- EXACTLY ${formData.table_6ft_round} (${formData.table_6ft_round}) 6ft Round Tables (circles)` : ''}
${formData.cocktail_tables !== "0" ? `- EXACTLY ${formData.cocktail_tables} (${formData.cocktail_tables}) Cocktail Tables (small circles)` : ''}

IMPORTANT: Draw the EXACT number of tables specified above. Count carefully. Do not add extra tables.

Create an elegant, well-balanced 2D floor plan showing:
- Top-down view with all elements clearly labeled with counts
- Optimal spacing for guest flow
- Professional architectural drawing style
- Clean lines and clear measurements
- Elegant arrangement maximizing space efficiency
- All furniture and fixtures properly positioned

Style: Clean architectural floor plan, professional event layout, top-down view, black and white with subtle shading, labeled elements with quantities.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      setLayout2D(response.url);
    } catch (error) {
      console.error("Error generating 2D layout:", error);
      alert("Error generating 2D layout. Please try again.");
    } finally {
      setIsLoading2D(false);
    }
  };

  const handleGenerate3D = async () => {
    setIsLoading3D(true);
    setRender3D(null);

    try {
      const totalLinenFt = (parseInt(formData.table_8ft || 0) * 16 + 
                           parseInt(formData.table_6ft || 0) * 12 + 
                           parseInt(formData.table_5ft_round || 0) * 15.7 + 
                           parseInt(formData.table_6ft_round || 0) * 18.8 +
                           parseInt(formData.cocktail_tables || 0) * 9.4).toFixed(0);

      const prompt = `Ultra realistic, cinematic 3D render of a luxurious event space interior.

Room: ${formData.room_length}ft x ${formData.room_width}ft elegant event venue

Setup includes:
${formData.stage_length && formData.stage_width ? `- Professional stage (${formData.stage_length}ft x ${formData.stage_width}ft) with dramatic lighting` : ''}
${formData.dance_floor_length && formData.dance_floor_width ? `- Polished dance floor (${formData.dance_floor_length}ft x ${formData.dance_floor_width}ft) with ambient uplighting` : ''}
${formData.bar_length && formData.bar_width ? `- Elegant bar area (${formData.bar_length}ft x ${formData.bar_width}ft) with backlit shelving` : ''}
${formData.video_wall_height && formData.video_wall_width ? `- Stunning LED video wall (${formData.video_wall_height}m x ${formData.video_wall_width}m) displaying elegant visuals` : ''}
${formData.table_8ft !== "0" || formData.table_6ft !== "0" || formData.table_5ft_round !== "0" || formData.table_6ft_round !== "0" ? `- Tables draped in luxurious ${formData.table_color} linens with elegant folds` : ''}
${formData.cocktail_tables !== "0" ? `- ${formData.cocktail_tables} cocktail tables with ${formData.table_color} draping` : ''}

Lighting Design:
- Warm amber uplighting along walls (approximately ${Math.ceil(parseFloat(formData.room_length || 0) * 2 + parseFloat(formData.room_width || 0) * 2) / 10} uplights)
- Pin spot lighting on each table centerpiece
- Dramatic stage wash with amber and gold tones
- Subtle LED strips under bar for glow effect
- Elegant chandeliers or pendant lighting overhead

Draping & Decor:
- Approximately ${totalLinenFt}ft of ${formData.table_color} table draping
- Flowing ceiling drape with warm lighting (optional enhancement)
- Wall draping in complementary tones for softer ambiance

Atmosphere:
- Sophisticated, high-end event aesthetic
- Warm, inviting amber and gold lighting
- Luxurious textures and materials
- Cinematic camera angle showcasing the full space
- Professional event production quality
- Glamorous and elegant presentation

Style: Photorealistic 3D render, luxury event venue, dramatic lighting, high-end production value, ultra detailed.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      setRender3D({
        url: response.url,
        suggestions: {
          drape: `${formData.table_color} table draping - approximately ${totalLinenFt} feet total`,
          lighting: `Suggested lighting package:
- ${Math.ceil((parseFloat(formData.room_length || 0) * 2 + parseFloat(formData.room_width || 0) * 2) / 10)} LED uplights (amber/warm white)
- ${parseInt(formData.table_8ft || 0) + parseInt(formData.table_6ft || 0) + parseInt(formData.table_5ft_round || 0) + parseInt(formData.table_6ft_round || 0)} pin spots for table centerpieces
- 4-6 stage wash lights (warm tones)
- LED strip lighting for bar and architectural accents`
        }
      });
    } catch (error) {
      console.error("Error generating 3D render:", error);
      alert("Error generating 3D render. Please try again.");
    } finally {
      setIsLoading3D(false);
    }
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
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <Layout className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Room Decor Designer</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Create elegant room layouts with professional 2D floor plans and stunning 3D renders
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <form onSubmit={handleGenerate2D} className="space-y-8">
            {/* Project Name */}
            <div>
              <Label className="text-zinc-400 text-sm">Project Name</Label>
              <Input
                required
                value={formData.project_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, project_name: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                placeholder="e.g., Smith Wedding Reception"
              />
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                LOCATION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Country</Label>
                  <Input
                    required
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Province / State</Label>
                  <Input
                    required
                    value={formData.province}
                    onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">City</Label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Room Dimensions */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-amber-400" />
                ROOM DIMENSIONS (feet)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Length</Label>
                  <Input
                    required
                    type="number"
                    value={formData.room_length}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room_length: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Width</Label>
                  <Input
                    required
                    type="number"
                    value={formData.room_width}
                    onChange={(e) => setFormData((prev) => ({ ...prev, room_width: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-11 rounded-lg mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Stage, Dance Floor, Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Stage (feet)</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Length</Label>
                    <Input
                      type="number"
                      value={formData.stage_length}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stage_length: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Width</Label>
                    <Input
                      type="number"
                      value={formData.stage_width}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stage_width: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Dance Floor (feet)</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Length</Label>
                    <Input
                      type="number"
                      value={formData.dance_floor_length}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dance_floor_length: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Width</Label>
                    <Input
                      type="number"
                      value={formData.dance_floor_width}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dance_floor_width: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Bar (feet)</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-zinc-400 text-xs">Length</Label>
                    <Input
                      type="number"
                      value={formData.bar_length}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bar_length: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-xs">Width</Label>
                    <Input
                      type="number"
                      value={formData.bar_width}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bar_width: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Wall */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">VIDEO WALL (metres)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Height</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.video_wall_height}
                    onChange={(e) => setFormData((prev) => ({ ...prev, video_wall_height: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Width</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.video_wall_width}
                    onChange={(e) => setFormData((prev) => ({ ...prev, video_wall_width: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Tables */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">TABLES</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label className="text-zinc-400 text-sm">8ft Banquet</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.table_8ft}
                    onChange={(e) => setFormData((prev) => ({ ...prev, table_8ft: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">6ft Banquet</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.table_6ft}
                    onChange={(e) => setFormData((prev) => ({ ...prev, table_6ft: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">5ft Round</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.table_5ft_round}
                    onChange={(e) => setFormData((prev) => ({ ...prev, table_5ft_round: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">6ft Round</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.table_6ft_round}
                    onChange={(e) => setFormData((prev) => ({ ...prev, table_6ft_round: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Cocktail Tables</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.cocktail_tables}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cocktail_tables: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Table Drape Color</Label>
                  <Select
                    value={formData.table_color}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, table_color: value }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      <SelectItem value="white" className="text-white">White</SelectItem>
                      <SelectItem value="black" className="text-white">Black</SelectItem>
                      <SelectItem value="ivory" className="text-white">Ivory</SelectItem>
                      <SelectItem value="champagne" className="text-white">Champagne</SelectItem>
                      <SelectItem value="gold" className="text-white">Gold</SelectItem>
                      <SelectItem value="silver" className="text-white">Silver</SelectItem>
                      <SelectItem value="navy" className="text-white">Navy</SelectItem>
                      <SelectItem value="burgundy" className="text-white">Burgundy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading2D}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-lg"
            >
              {isLoading2D ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate 2D Layout
                </>
              )}
            </Button>
          </form>
        </motion.div>

        {/* Gear List */}
        {gearList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Equipment List & Costs</h2>
            <div className="space-y-4">
              {gearList.costs.tables_8ft.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">8ft Banquet Tables ({gearList.costs.tables_8ft.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.tables_8ft.total}</span>
                </div>
              )}
              {gearList.costs.tables_6ft.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">6ft Banquet Tables ({gearList.costs.tables_6ft.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.tables_6ft.total}</span>
                </div>
              )}
              {gearList.costs.tables_5ft_round.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">5ft Round Tables ({gearList.costs.tables_5ft_round.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.tables_5ft_round.total}</span>
                </div>
              )}
              {gearList.costs.tables_6ft_round.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">6ft Round Tables ({gearList.costs.tables_6ft_round.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.tables_6ft_round.total}</span>
                </div>
              )}
              {gearList.costs.cocktail_tables.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Cocktail Tables ({gearList.costs.cocktail_tables.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.cocktail_tables.total}</span>
                </div>
              )}
              {gearList.costs.table_linen.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Table Linens ({gearList.costs.table_linen.count})</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.table_linen.total}</span>
                </div>
              )}
              {gearList.costs.stage.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Stage ({gearList.costs.stage.area.toFixed(0)} sq ft)</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.stage.total.toFixed(0)}</span>
                </div>
              )}
              {gearList.costs.dance_floor.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Dance Floor ({gearList.costs.dance_floor.area.toFixed(0)} sq ft)</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.dance_floor.total.toFixed(0)}</span>
                </div>
              )}
              {gearList.costs.video_wall.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Video Wall ({gearList.costs.video_wall.area.toFixed(1)} m²)</span>
                  <span className="text-amber-400 font-semibold">${gearList.costs.video_wall.total.toFixed(0)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-amber-500/30">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-amber-400">${gearList.totalCost.toFixed(0)}</span>
              </div>
              
              <p className="text-zinc-500 text-sm mt-4 italic">
                *Prices do not include labour or pickup and delivery
              </p>
            </div>
          </motion.div>
        )}

        {/* 2D Layout */}
        {layout2D && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Layout className="w-6 h-6 text-amber-400" />
              2D Floor Plan
            </h2>
            <div className="bg-white rounded-lg p-4">
              <img src={layout2D} alt="2D floor plan layout" className="w-full h-auto" />
            </div>
            
            <Button
              onClick={handleGenerate3D}
              disabled={isLoading3D}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-12 rounded-lg"
            >
              {isLoading3D ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Box className="w-5 h-5 mr-2" />
              )}
              Generate 3D Render
            </Button>
          </motion.div>
        )}

        {/* 3D Render */}
        {render3D && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Box className="w-6 h-6 text-amber-400" />
              3D Render
            </h2>
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <img src={render3D.url} alt="3D render of room layout" className="w-full h-auto" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Draping Suggestion</h3>
                <p className="text-zinc-300">{render3D.suggestions.drape}</p>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Lighting Suggestion</h3>
                <pre className="text-zinc-300 whitespace-pre-wrap font-sans">{render3D.suggestions.lighting}</pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}