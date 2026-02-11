import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Ruler, Layout, Box, DollarSign, Loader2, Save, FolderOpen, X, FileDown, Lock, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import InteractiveRoomCanvas from "@/components/room/InteractiveRoomCanvas";
import RoomItemInputs from "@/components/room/RoomItemInputs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import { useSubscriptionStatus } from "@/components/useSubscriptionStatus";
import SubscriptionModal from "@/components/SubscriptionModal";
import AILayoutSuggestions from "@/components/AILayoutSuggestions";

export default function RoomDesigner() {
  const [formData, setFormData] = useState({
    project_name: "",
    event_type: "",
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

  const [showCanvas, setShowCanvas] = useState(false);
  const [render3D, setRender3D] = useState(null);
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [showGearList, setShowGearList] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const [roomItems, setRoomItems] = useState([]);
  const [tableColor, setTableColor] = useState('white');
  const render3DRef = useRef(null);

  const { isSubscribed } = useSubscriptionStatus();
  const queryClient = useQueryClient();
  const { data: savedProjects = [] } = useQuery({
    queryKey: ['room-projects'],
    queryFn: () => base44.entities.RoomProject.list('-updated_date')
  });

  const handleGenerate2D = (e) => {
    e.preventDefault();
    setShowCanvas(true);
  };

  const handleAddItems = (newItems, color) => {
    const itemsWithIds = newItems.map((item, idx) => ({
      ...item,
      id: `${item.type}-${Date.now()}-${idx}`,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      rotation: 0
    }));
    setRoomItems(prev => [...prev, ...itemsWithIds]);
    setTableColor(color);
  };

  const calculateGearList = () => {
    // Calculate from roomItems instead of formData
    const stages = roomItems.filter(item => item.type === 'stage');
    const danceFloors = roomItems.filter(item => item.type === 'dancefloor');
    const videoWalls = roomItems.filter(item => item.type === 'videowall');
    const tables8ft = roomItems.filter(item => item.type === 'table_8ft');
    const tables6ft = roomItems.filter(item => item.type === 'table_6ft');
    const tables5ftRound = roomItems.filter(item => item.type === 'table_5ft_round');
    const tables6ftRound = roomItems.filter(item => item.type === 'table_6ft_round');
    const cocktailTables = roomItems.filter(item => item.type === 'cocktail');

    const stageArea = stages.reduce((sum, s) => sum + (s.length * s.width), 0);
    const danceFloorArea = danceFloors.reduce((sum, df) => sum + (df.length * df.width), 0);
    const videoWallAreaM2 = videoWalls.reduce((sum, vw) => sum + (vw.height * vw.width), 0);

    const table8ftCount = tables8ft.length;
    const table6ftCount = tables6ft.length;
    const table5ftRoundCount = tables5ftRound.length;
    const table6ftRoundCount = tables6ftRound.length;
    const cocktailTableCount = cocktailTables.length;

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

  const handleGenerate3D = async () => {
    setIsLoading3D(true);
    setRender3D(null);

    try {
      // Get event type context
      const eventTypeDescriptions = {
        wedding: "romantic wedding reception with soft, elegant decor and intimate ambiance",
        conference: "professional corporate conference with modern, clean design and tech-forward aesthetics",
        music_concert: "energetic concert venue with dynamic stage lighting and vibrant atmosphere",
        celebration_of_life: "warm, dignified memorial service with tasteful, comforting decor",
        lecture: "academic lecture hall setting with focused, professional ambiance",
        film_screening: "cinema-style viewing space with theatrical lighting and comfortable seating",
        dinner_party: "intimate dinner party with cozy, sophisticated atmosphere",
        family_get_together: "welcoming family gathering space with warm, casual elegance",
        presentation: "professional presentation venue with clean, modern aesthetics",
        workshop: "collaborative workshop space with functional, inspiring design"
      };

      const eventContext = formData.event_type ? eventTypeDescriptions[formData.event_type] || "elegant event space" : "elegant event space";

      // Analyze placed items
      const itemSummary = roomItems.map(item => {
        const position = `positioned at ${Math.round(item.x)}, ${Math.round(item.y)}`;
        if (item.type === 'stage') return `Stage (${item.width}' x ${item.length}') ${position}`;
        if (item.type === 'dancefloor') return `Dance floor (${item.width}' x ${item.length}') ${position}`;
        if (item.type === 'bar') return `Bar (${item.width}' x ${item.length}') ${position}`;
        if (item.type === 'videowall') return `Video wall (${item.width}m x ${item.height}m) ${position}`;
        if (item.type.includes('table')) return `${item.type.replace('_', ' ')} ${position}`;
        return `${item.name || item.type} ${position}`;
      }).join('\n- ');

      const tableCount = roomItems.filter(i => i.type.includes('table')).length;
      
      const prompt = `Ultra realistic, cinematic 3D render of ${eventContext}.

Event Type: ${formData.event_type ? formData.event_type.replace('_', ' ').toUpperCase() : 'ELEGANT EVENT'}
Room Dimensions: ${formData.room_length}ft x ${formData.room_width}ft

Layout Configuration:
${itemSummary ? `- ${itemSummary}` : 'Open floor plan with flexible seating'}

Design Elements:
${roomItems.some(i => i.type === 'stage') ? '- Professional stage with theatrical lighting appropriate for the event type' : ''}
${roomItems.some(i => i.type === 'dancefloor') ? '- Polished dance floor with ambient uplighting' : ''}
${roomItems.some(i => i.type === 'bar') ? '- Elegant bar area with backlit shelving and premium finishes' : ''}
${roomItems.some(i => i.type === 'videowall') ? '- High-resolution LED video wall displaying event-appropriate visuals' : ''}
${tableCount > 0 ? `- ${tableCount} tables draped in luxurious ${tableColor} linens, arranged as shown in layout` : ''}

Lighting & Atmosphere:
- Lighting design tailored specifically for ${formData.event_type ? formData.event_type.replace('_', ' ') : 'this event'}
- Warm ambient lighting creating the perfect mood
- Strategic accent lighting highlighting key areas
- Color palette and intensity appropriate for event type
${roomItems.some(i => i.type === 'stage') ? '- Dramatic stage wash with professional production lighting' : ''}

Decor & Styling:
- Event-specific decor matching ${formData.event_type ? formData.event_type.replace('_', ' ') : 'elegant occasion'}
- Premium materials and luxurious finishes throughout
- Spatial arrangement exactly as configured in the floor plan
- Cohesive design language from entrance to main areas

Camera & Presentation:
- Cinematic wide-angle view showcasing the complete layout
- Professional architectural visualization quality
- Ultra-detailed textures and realistic materials
- Photorealistic rendering with accurate spatial relationships

Style: Photorealistic 3D render, ${formData.event_type ? formData.event_type.replace('_', ' ') : 'luxury event'}, contextually appropriate design, high-end production value, ultra detailed.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      const renderData = {
        url: response.url,
        suggestions: {
          drape: `${formData.table_color} table draping - approximately ${totalLinenFt} feet total`,
          lighting: `Suggested lighting package:
- ${Math.ceil((parseFloat(formData.room_length || 0) * 2 + parseFloat(formData.room_width || 0) * 2) / 10)} LED uplights (amber/warm white)
- ${parseInt(formData.table_8ft || 0) + parseInt(formData.table_6ft || 0) + parseInt(formData.table_5ft_round || 0) + parseInt(formData.table_6ft_round || 0)} pin spots for table centerpieces
- 4-6 stage wash lights (warm tones)
- LED strip lighting for bar and architectural accents`
        }
      };
      setRender3D(renderData);
      
      setTimeout(() => {
        render3DRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating 3D render:", error);
      alert("Error generating 3D render. Please try again.");
    } finally {
      setIsLoading3D(false);
    }
  };

  const gearList = showGearList ? calculateGearList() : null;

  const handleSaveProject = async () => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    if (!formData.project_name.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      const projectData = {
        ...formData,
        render_3d_url: render3D?.url || "",
        room_items: roomItems,
        table_color: tableColor
      };

      if (currentProjectId) {
        await base44.entities.RoomProject.update(currentProjectId, projectData);
      } else {
        const newProject = await base44.entities.RoomProject.create(projectData);
        setCurrentProjectId(newProject.id);
      }

      queryClient.invalidateQueries(['room-projects']);
      setShowSaveModal(false);
      alert('Project saved successfully!');
    } catch (error) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleLoadProject = (project) => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    setFormData({
      project_name: project.project_name,
      event_type: project.event_type || "",
      country: project.country,
      province: project.province,
      city: project.city,
      room_length: project.room_length,
      room_width: project.room_width,
      stage_length: project.stage_length || "",
      stage_width: project.stage_width || "",
      dance_floor_length: project.dance_floor_length || "",
      dance_floor_width: project.dance_floor_width || "",
      bar_length: project.bar_length || "",
      bar_width: project.bar_width || "",
      video_wall_height: project.video_wall_height || "",
      video_wall_width: project.video_wall_width || "",
      table_8ft: project.table_8ft || "0",
      table_6ft: project.table_6ft || "0",
      table_5ft_round: project.table_5ft_round || "0",
      table_6ft_round: project.table_6ft_round || "0",
      cocktail_tables: project.cocktail_tables || "0",
      table_color: project.table_color || "white"
    });
    setRoomItems(project.room_items || []);
    setTableColor(project.table_color || "white");
    setCurrentProjectId(project.id);
    setShowCanvas(true);
    if (project.render_3d_url) {
      setRender3D({
        url: project.render_3d_url,
        suggestions: {
          drape: `${project.table_color} table draping`,
          lighting: "Lighting suggestions available after re-generation"
        }
      });
    }
    setShowLoadModal(false);
  };

  const handleGetAISuggestions = async () => {
    setAILoading(true);
    try {
      const response = await base44.functions.invoke('getAILayoutSuggestions', {
        designType: 'room',
        parameters: {
          roomLength: formData.room_length,
          roomWidth: formData.room_width,
          eventType: formData.project_name,
          attendeeCount: 'To be estimated',
          stageLength: formData.stage_length,
          stageWidth: formData.stage_width,
          danceFloorLength: formData.dance_floor_length,
          danceFloorWidth: formData.dance_floor_width,
          barLength: formData.bar_length,
          barWidth: formData.bar_width,
          videoWallHeight: formData.video_wall_height,
          videoWallWidth: formData.video_wall_width,
          table8ft: formData.table_8ft,
          table6ft: formData.table_6ft,
          table5ftRound: formData.table_5ft_round,
          table6ftRound: formData.table_6ft_round,
          cocktailTables: formData.cocktail_tables,
          tableColor: formData.table_color
        }
      });
      setAISuggestions(response.data.suggestions);
      setShowAISuggestions(true);
    } catch (error) {
      alert('Error generating suggestions: ' + error.message);
    } finally {
      setAILoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!isSubscribed) {
      setShowSubscriptionModal(true);
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(245, 158, 11); // Amber
    pdf.text('Room Design Report', pageWidth / 2, yPos, { align: 'center' });
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
    yPos += 6;
    pdf.text(`Room: ${formData.room_length}' x ${formData.room_width}'`, margin, yPos);
    yPos += 10;

    // Equipment Summary
    pdf.setFontSize(14);
    pdf.text('Equipment Summary', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    const items = [];
    if (formData.stage_length && formData.stage_width) {
      items.push(`Stage: ${formData.stage_length}' x ${formData.stage_width}'`);
    }
    if (formData.dance_floor_length && formData.dance_floor_width) {
      items.push(`Dance Floor: ${formData.dance_floor_length}' x ${formData.dance_floor_width}'`);
    }
    if (formData.bar_length && formData.bar_width) {
      items.push(`Bar: ${formData.bar_length}' x ${formData.bar_width}'`);
    }
    if (formData.video_wall_height && formData.video_wall_width) {
      items.push(`Video Wall: ${formData.video_wall_height}m x ${formData.video_wall_width}m`);
    }
    if (formData.table_8ft !== "0") items.push(`8ft Tables: ${formData.table_8ft}`);
    if (formData.table_6ft !== "0") items.push(`6ft Tables: ${formData.table_6ft}`);
    if (formData.table_5ft_round !== "0") items.push(`5ft Round Tables: ${formData.table_5ft_round}`);
    if (formData.table_6ft_round !== "0") items.push(`6ft Round Tables: ${formData.table_6ft_round}`);
    if (formData.cocktail_tables !== "0") items.push(`Cocktail Tables: ${formData.cocktail_tables}`);

    items.forEach(item => {
      pdf.text(`• ${item}`, margin + 5, yPos);
      yPos += 6;
    });
    yPos += 5;

    // Gear List with Costs
    if (gearList) {
      pdf.setFontSize(14);
      pdf.text('Cost Breakdown', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      if (gearList.costs.tables_8ft.count > 0) {
        pdf.text(`8ft Tables: ${gearList.costs.tables_8ft.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.tables_6ft.count > 0) {
        pdf.text(`6ft Tables: ${gearList.costs.tables_6ft.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.tables_5ft_round.count > 0) {
        pdf.text(`5ft Round Tables: ${gearList.costs.tables_5ft_round.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.tables_6ft_round.count > 0) {
        pdf.text(`6ft Round Tables: ${gearList.costs.tables_6ft_round.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.cocktail_tables.count > 0) {
        pdf.text(`Cocktail Tables: ${gearList.costs.cocktail_tables.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.table_linen.count > 0) {
        pdf.text(`Table Linens: ${gearList.costs.table_linen.total}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.stage.area > 0) {
        pdf.text(`Stage: ${gearList.costs.stage.total.toFixed(0)}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.dance_floor.area > 0) {
        pdf.text(`Dance Floor: ${gearList.costs.dance_floor.total.toFixed(0)}`, margin, yPos);
        yPos += 6;
      }
      if (gearList.costs.video_wall.area > 0) {
        pdf.text(`Video Wall: ${gearList.costs.video_wall.total.toFixed(0)}`, margin, yPos);
        yPos += 6;
      }

      yPos += 5;
      pdf.setFontSize(12);
      pdf.text(`Total: ${gearList.totalCost.toFixed(0)}`, margin, yPos);
      yPos += 10;
    }

    // 3D Render
    if (render3D?.url) {
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.text('3D Visualization', margin, yPos);
      yPos += 10;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = render3D.url;
        
        img.onload = () => {
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (img.height * imgWidth) / img.width;
          const maxHeight = pageHeight - yPos - 30;
          
          const finalHeight = Math.min(imgHeight, maxHeight);
          const finalWidth = (img.width * finalHeight) / img.height;

          pdf.addImage(render3D.url, 'JPEG', margin, yPos, finalWidth, finalHeight);

          // Footer
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

          const fileName = `${formData.project_name || 'room-design'}-${Date.now()}.pdf`;
          pdf.save(fileName);
        };

        img.onerror = () => {
          // Save without image
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

          const fileName = `${formData.project_name || 'room-design'}-${Date.now()}.pdf`;
          pdf.save(fileName);
        };
      } catch (error) {
        console.error('Error adding image:', error);
      }
    } else {
      // Footer
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

      const fileName = `${formData.project_name || 'room-design'}-${Date.now()}.pdf`;
      pdf.save(fileName);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
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

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <form onSubmit={handleGenerate2D} className="space-y-6">
              {/* Project Name & Event Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-zinc-400 text-sm">Project Name</Label>
                  <Input
                    value={formData.project_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, project_name: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-10 rounded-lg mt-1"
                    placeholder="e.g., Summer Gala 2026"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Event Type</Label>
                  <Select 
                    value={formData.event_type} 
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, event_type: value }))}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="music_concert">Music Concert</SelectItem>
                      <SelectItem value="celebration_of_life">Celebration of Life</SelectItem>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="film_screening">Film Screening</SelectItem>
                      <SelectItem value="dinner_party">Dinner Party</SelectItem>
                      <SelectItem value="family_get_together">Family Get Together</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  LOCATION
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-sm">Country</Label>
                    <Input
                      required
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm">Province / State</Label>
                    <Input
                      required
                      value={formData.province}
                      onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm">City</Label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-amber-500/50 h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Room Dimensions */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-amber-400" />
                  ROOM (feet)
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-zinc-400 text-sm">Length</Label>
                    <Input
                      required
                      type="number"
                      value={formData.room_length}
                      onChange={(e) => setFormData((prev) => ({ ...prev, room_length: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-400 text-sm">Width</Label>
                    <Input
                      required
                      type="number"
                      value={formData.room_width}
                      onChange={(e) => setFormData((prev) => ({ ...prev, room_width: e.target.value }))}
                      className="bg-zinc-900 border-zinc-700 text-white h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
              </div>



              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 rounded-lg"
              >
                <Layout className="w-5 h-5 mr-2" />
                Generate 2D
              </Button>

              {showCanvas && <RoomItemInputs onAddItems={handleAddItems} />}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => !isSubscribed ? setShowSubscriptionModal(true) : setShowLoadModal(true)}
                  className={`h-12 rounded-lg ${!isSubscribed ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'}`}
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Load {!isSubscribed && <Lock className="w-4 h-4 ml-1" />}
                </Button>
                {showCanvas && (
                  <Button
                    type="button"
                    onClick={() => !isSubscribed ? setShowSubscriptionModal(true) : setShowSaveModal(true)}
                    className={`h-12 rounded-lg ${!isSubscribed ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save {!isSubscribed && <Lock className="w-4 h-4 ml-1" />}
                  </Button>
                )}
              </div>
              {showCanvas && (
                <Button
                  type="button"
                  onClick={handleExportPDF}
                  className={`w-full h-12 rounded-lg ${!isSubscribed ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600 text-black'}`}
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  Export PDF {!isSubscribed && <Lock className="w-4 h-4 ml-1" />}
                </Button>
              )}
            </form>
          </motion.div>

          {/* Right Side - Canvas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            {showCanvas ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Layout className="w-6 h-6 text-amber-400" />
                  Interactive Floor Plan
                </h2>
                <InteractiveRoomCanvas 
                  formData={formData} 
                  items={roomItems}
                  onItemsChange={setRoomItems}
                />
                
                <div className="flex gap-3 flex-col">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleGenerate3D}
                      disabled={isLoading3D}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold h-12 rounded-lg"
                    >
                      {isLoading3D ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Box className="w-5 h-5 mr-2" />
                      )}
                      A.I. Design
                    </Button>
                    <Button
                      onClick={() => setShowGearList(!showGearList)}
                      variant="outline"
                      className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-12 rounded-lg"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      {showGearList ? 'Hide' : 'Show'} Gear List
                    </Button>
                  </div>
                  <Button
                    onClick={handleGetAISuggestions}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold h-12 rounded-lg"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Lightbulb className="w-5 h-5 mr-2" />
                    )}
                    Get AI Suggestions
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Enter event details and click Generate 2D Layout</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* 3D Render */}
        {render3D && (
          <motion.div
            ref={render3DRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Box className="w-6 h-6 text-amber-400" />
              3D Render
            </h2>
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <img src={render3D.url} alt="3D render of room layout" className="w-full h-auto" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Draping Suggestion</h3>
                <p className="text-zinc-300">{render3D.suggestions.drape}</p>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Lighting Suggestion</h3>
                <pre className="text-zinc-300 whitespace-pre-wrap font-sans text-sm">{render3D.suggestions.lighting}</pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gear List */}
        {gearList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-amber-400" />
              Equipment List & Costs
            </h2>
            <div className="space-y-4">
              {gearList.costs.tables_8ft.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">8ft Banquet Tables ({gearList.costs.tables_8ft.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.tables_8ft.total}</span>
                </div>
              )}
              {gearList.costs.tables_6ft.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">6ft Banquet Tables ({gearList.costs.tables_6ft.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.tables_6ft.total}</span>
                </div>
              )}
              {gearList.costs.tables_5ft_round.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">5ft Round Tables ({gearList.costs.tables_5ft_round.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.tables_5ft_round.total}</span>
                </div>
              )}
              {gearList.costs.tables_6ft_round.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">6ft Round Tables ({gearList.costs.tables_6ft_round.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.tables_6ft_round.total}</span>
                </div>
              )}
              {gearList.costs.cocktail_tables.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Cocktail Tables ({gearList.costs.cocktail_tables.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.cocktail_tables.total}</span>
                </div>
              )}
              {gearList.costs.table_linen.count > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Table Linens ({gearList.costs.table_linen.count})</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.table_linen.total}</span>
                </div>
              )}
              {gearList.costs.stage.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Stage ({gearList.costs.stage.area.toFixed(0)} sq ft)</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.stage.total.toFixed(0)}</span>
                </div>
              )}
              {gearList.costs.dance_floor.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Dance Floor ({gearList.costs.dance_floor.area.toFixed(0)} sq ft)</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.dance_floor.total.toFixed(0)}</span>
                </div>
              )}
              {gearList.costs.video_wall.area > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-zinc-800">
                  <span className="text-zinc-300">Video Wall ({gearList.costs.video_wall.area.toFixed(1)} m²)</span>
                  <span className="text-amber-400 font-semibold">{gearList.costs.video_wall.total.toFixed(0)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-amber-500/30">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-amber-400">{gearList.totalCost.toFixed(0)}</span>
              </div>
              
              <p className="text-zinc-500 text-sm mt-4 italic">
                *Prices do not include labour or pickup and delivery
              </p>
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
                        <p>Room: {project.room_length}' x {project.room_width}'</p>
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

        {/* Subscription Modal */}
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={async () => {
            try {
              const user = await base44.auth.me();
              const response = await base44.functions.invoke('createCheckoutSession', {
                email: user.email,
                successUrl: window.location.href,
                cancelUrl: window.location.href
              });
              window.location.href = response.data.url;
            } catch (error) {
              alert('Error starting checkout: ' + error.message);
            }
          }}
        />

        {/* AI Suggestions Modal */}
        <AILayoutSuggestions
          isOpen={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
          suggestions={aiSuggestions}
          isLoading={aiLoading}
        />
      </div>
    </div>
  );
}