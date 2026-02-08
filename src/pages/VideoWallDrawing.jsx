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
import { MonitorPlay, Loader2, MapPin, Ruler, Sparkles, FileText, Box, Save, FolderOpen, X, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";

export default function VideoWallDrawing() {
  const [formData, setFormData] = useState({
    project_name: "",
    country: "",
    province: "",
    city: "",
    wall_height: "",
    wall_width: "",
    height_off_ground: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [drawingUrl, setDrawingUrl] = useState(null);
  const [gearList, setGearList] = useState(null);
  const [isGeneratingGear, setIsGeneratingGear] = useState(false);
  const [renderUrl, setRenderUrl] = useState(null);
  const [isGeneratingRender, setIsGeneratingRender] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const queryClient = useQueryClient();
  const { data: savedProjects = [] } = useQuery({
    queryKey: ['video-wall-projects'],
    queryFn: () => base44.entities.VideoWallProject.list('-updated_date')
  });

  const heightOffGroundInFeet = formData.height_off_ground ? parseFloat(formData.height_off_ground) * 3.28084 : 0;

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

    const heightOffGroundFt = heightOffGround * 3.28084;

    if (heightOffGroundFt < 2) {
      // Black box mounting
      boxCount = 1;
      boxCost = 150; // Estimated cost for custom box
    } else {
      // Calculate stage decks needed
      const stageWidthFt = 4;
      const stageLengthNeededFt = Math.max(width * 3.28084, width * 3.28084); // Ensure stage is at least as wide as video wall
      
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
    }

    return {
      videoPanels: { count: totalPanels, dimensions: `${panelsHigh} high x ${panelsWide} wide`, cost: panelCost },
      stageDecks: stageDeckCount > 0 ? { count: stageDeckCount, cost: stageDeckCost } : null,
      box: boxCount > 0 ? { count: boxCount, cost: boxCost } : null,
      totalCost: panelCost + stageDeckCost + boxCost
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

      let setupDescription = `Video Wall Setup:

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
      } else {
        setupDescription += `Mounting: Stage platform
      - Stage dimensions: 1.2m (4ft) deep x ${width}m wide (matches video wall width)
      - Built with 4x8ft and 4x4ft stage deck platforms
      - Maximum one 4x8ft deck, remaining length with 4x4ft decks
      - Stage height: ${heightOffGround}m
      - Video wall rests directly on stage
      `;
      }

      setupDescription += `
      Important: Video wall is built from LED panels that are 1m high × 0.5m wide each.

      Draw this as a visual side-view diagram showing:
      - The LED panels (video wall) as a large flat rectangle with NO legs
      - If on stage: bottom of video wall rests on top of stage platform
      - If on ground: bottom of video wall rests directly on ground
      - All structural support (box/stage) visible with clear proportions
      - Key measurements labeled, including a clear measurement line showing the distance from ground to the BOTTOM of the video wall (${heightOffGround}m / ${heightOffGroundFt.toFixed(1)}ft)
      - Ground level reference line
      - A vertical measurement line from ground up to the bottom of the video wall showing the ${heightOffGround}m (${heightOffGroundFt.toFixed(1)}ft) clearance
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
      } else {
        renderPrompt += `- Positioned on a professional stage platform
- Industrial stage deck construction
- Stage is ${heightOffGround}m high
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
      project_name: "",
      country: "",
      province: "",
      city: "",
      wall_height: "",
      wall_width: "",
      height_off_ground: "",
    });
    setDrawingUrl(null);
    setGearList(null);
    setRenderUrl(null);
  };

  const handleSaveProject = async () => {
    if (!formData.project_name.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const projectData = {
        project_name: formData.project_name,
        country: formData.country,
        province: formData.province,
        city: formData.city,
        wall_height: formData.wall_height,
        wall_width: formData.wall_width,
        height_off_ground: formData.height_off_ground,
        drawing_url: drawingUrl || "",
        render_url: renderUrl || ""
      };

      if (currentProjectId) {
        await base44.entities.VideoWallProject.update(currentProjectId, projectData);
      } else {
        const newProject = await base44.entities.VideoWallProject.create(projectData);
        setCurrentProjectId(newProject.id);
      }

      queryClient.invalidateQueries(['video-wall-projects']);
      setShowSaveModal(false);
      alert('Project saved successfully!');
    } catch (error) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleLoadProject = (project) => {
    setFormData({
      project_name: project.project_name,
      country: project.country,
      province: project.province,
      city: project.city,
      wall_height: project.wall_height,
      wall_width: project.wall_width,
      height_off_ground: project.height_off_ground
    });
    setDrawingUrl(project.drawing_url || null);
    setRenderUrl(project.render_url || null);
    setCurrentProjectId(project.id);
    setShowLoadModal(false);
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(34, 197, 94);
    pdf.text('Video Wall Setup Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Project Details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Project Information', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    if (formData.project_name) {
      pdf.text(`Project: ${formData.project_name}`, margin, yPos);
      yPos += 6;
    }
    pdf.text(`Location: ${formData.city}, ${formData.province}, ${formData.country}`, margin, yPos);
    yPos += 10;

    // Specifications
    pdf.setFontSize(14);
    pdf.text('Specifications', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.text(`Screen Height: ${formData.wall_height}m`, margin, yPos);
    yPos += 6;
    pdf.text(`Screen Width: ${formData.wall_width}m`, margin, yPos);
    yPos += 6;
    const heightFt = (parseFloat(formData.height_off_ground) * 3.28084).toFixed(1);
    pdf.text(`Height Off Ground: ${formData.height_off_ground}m (${heightFt}ft)`, margin, yPos);
    yPos += 10;

    // Gear List
    if (gearList) {
      pdf.setFontSize(14);
      pdf.text('Equipment & Costs', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.text(`LED Video Panels: ${gearList.videoPanels.count} panels (${gearList.videoPanels.dimensions}) - $${gearList.videoPanels.cost.toLocaleString()}`, margin, yPos);
      yPos += 6;

      if (gearList.stageDecks) {
        pdf.text(`Stage Decks: ${gearList.stageDecks.count} decks - $${gearList.stageDecks.cost.toLocaleString()}`, margin, yPos);
        yPos += 6;
      }

      if (gearList.box) {
        pdf.text(`Support Box: $${gearList.box.cost.toLocaleString()}`, margin, yPos);
        yPos += 6;
      }

      yPos += 3;
      pdf.setFontSize(12);
      pdf.setTextColor(34, 197, 94);
      pdf.text(`Total Estimated Cost: $${gearList.totalCost.toLocaleString()}`, margin, yPos);
      pdf.setTextColor(0, 0, 0);
      yPos += 10;
    }

    // Drawing
    if (drawingUrl) {
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.text('Setup Drawing', margin, yPos);
      yPos += 10;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = drawingUrl;

      img.onload = () => {
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (img.height * imgWidth) / img.width;
        const maxHeight = pageHeight - yPos - 30;
        
        const finalHeight = Math.min(imgHeight, maxHeight);
        const finalWidth = (img.width * finalHeight) / img.height;

        pdf.addImage(drawingUrl, 'JPEG', margin, yPos, finalWidth, finalHeight);

        // Add footer and save
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          pdf.text(
            `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }

        const fileName = `${formData.project_name || 'video-wall'}-${Date.now()}.pdf`;
        pdf.save(fileName);
      };

      img.onerror = () => {
        savePDFWithoutImage();
      };
    } else {
      savePDFWithoutImage();
    }

    function savePDFWithoutImage() {
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const fileName = `${formData.project_name || 'video-wall'}-${Date.now()}.pdf`;
      pdf.save(fileName);
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
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <MonitorPlay className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Video Wall Setup Drawing Generator</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Generate setup drawings and equipment lists for your LED video wall installation
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
            {/* Project Name */}
            <div>
              <Label className="text-zinc-400 text-sm">Project Name</Label>
              <Input
                value={formData.project_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, project_name: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                placeholder="e.g., Corporate Event 2026"
              />
            </div>

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
                      setFormData((prev) => ({ ...prev, height_off_ground: value }));
                    }}
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="text-white">
                          {h}m ({(h * 3.28084).toFixed(1)}ft)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>



            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
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
                  onClick={() => setShowLoadModal(true)}
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white h-12 rounded-lg px-6"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Load
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

              {drawingUrl && (
                <Button
                  type="button"
                  onClick={() => setShowSaveModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 rounded-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Project
                </Button>
              )}
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
              Setup Drawing
            </h2>
            <div className="bg-white rounded-lg p-4">
              <img src={drawingUrl} alt="Video wall setup drawing" className="w-full h-auto" />
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
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

              <Button
                onClick={handleExportPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-lg"
              >
                <FileDown className="w-5 h-5 mr-2" />
                Export PDF
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

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {currentProjectId ? 'Update Project' : 'Save Project'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSaveModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-zinc-300 text-sm">
                  {formData.project_name ? `Saving: ${formData.project_name}` : 'Please enter a project name first'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSaveModal(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProject}
                    disabled={!formData.project_name}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {currentProjectId ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Load Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Load Project</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLoadModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {savedProjects.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No saved projects yet</p>
              ) : (
                <div className="space-y-3">
                  {savedProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleLoadProject(project)}
                      className="border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-semibold text-white mb-2">{project.project_name}</h4>
                      <div className="text-sm text-zinc-400 space-y-1">
                        <p>Location: {project.city}, {project.province}, {project.country}</p>
                        <p>Screen: {project.wall_width}m × {project.wall_height}m</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          Saved: {new Date(project.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}