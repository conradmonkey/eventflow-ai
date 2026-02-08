import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TentInputPanel from '@/components/tent/TentInputPanel';
import TentCanvas2D from '@/components/tent/TentCanvas2D';

import TentGearList from '@/components/tent/TentGearList';
import { Sparkles, Plus, Camera, X, Save, FolderOpen, FileDown, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';

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
  const [realisticImage, setRealisticImage] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingRealistic, setGeneratingRealistic] = useState(false);
  const canvasRef = useRef(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [projectCategory, setProjectCategory] = useState('Uncategorized');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedProjectForHistory, setSelectedProjectForHistory] = useState(null);

  const queryClient = useQueryClient();
  const { data: savedProjects = [] } = useQuery({
    queryKey: ['tent-projects'],
    queryFn: () => base44.entities.TentProject.list('-updated_date')
  });

  const { data: projectVersions = [] } = useQuery({
    queryKey: ['tent-project-versions', selectedProjectForHistory?.id],
    queryFn: () => selectedProjectForHistory 
      ? base44.entities.TentProjectVersion.filter({ project_id: selectedProjectForHistory.id }, '-version_number')
      : Promise.resolve([]),
    enabled: !!selectedProjectForHistory
  });

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const projectData = {
      project_name: projectName,
      category: projectCategory,
      attendees,
      seating_arrangement: seatingArrangement,
      tent_style: tentStyle,
      tent_width: tentConfig.width,
      tent_length: tentConfig.length,
      tent_config: tentConfig
    };

    try {
      let projectId = currentProjectId;
      let currentVersion = 1;

      if (currentProjectId) {
        const existingProject = savedProjects.find(p => p.id === currentProjectId);
        currentVersion = (existingProject?.version || 0) + 1;
        projectData.version = currentVersion;
        await base44.entities.TentProject.update(currentProjectId, projectData);
      } else {
        const newProject = await base44.entities.TentProject.create(projectData);
        projectId = newProject.id;
        setCurrentProjectId(projectId);
      }

      // Create version history entry
      await base44.entities.TentProjectVersion.create({
        project_id: projectId,
        project_name: projectName,
        version_number: currentVersion,
        attendees,
        seating_arrangement: seatingArrangement,
        tent_style: tentStyle,
        tent_width: tentConfig.width,
        tent_length: tentConfig.length,
        tent_config: tentConfig,
        description: currentProjectId ? 'Updated design' : 'Initial design'
      });

      queryClient.invalidateQueries(['tent-projects']);
      queryClient.invalidateQueries(['tent-project-versions']);
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
    setProjectCategory(project.category || 'Uncategorized');
    setCurrentProjectId(project.id);
    setShowLoadModal(false);
  };

  const handleLoadVersion = (version) => {
    setProjectName(version.project_name);
    setAttendees(version.attendees);
    setSeatingArrangement(version.seating_arrangement);
    setTentStyle(version.tent_style);
    setTentConfig(version.tent_config);
    setShowVersionHistory(false);
    alert(`Loaded version ${version.version_number}. Save to create a new version.`);
  };

  const categorizedProjects = savedProjects.reduce((acc, project) => {
    const cat = project.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {});

  const handleExportPDF = async () => {
    // Generate AI image if not already generated
    let imageToUse = generatedImage;
    if (!imageToUse) {
      try {
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
        imageToUse = response.url;
        setGeneratedImage(imageToUse);
      } catch (error) {
        console.error('Failed to generate image for PDF:', error);
      }
    }

    // Generate realistic image if not already generated
    let realisticImageToUse = realisticImage;
    if (!realisticImageToUse) {
      try {
        const itemCounts = {};
        items.forEach(item => {
          itemCounts[item.type] = (itemCounts[item.type] || 0) + 1;
        });

        let setupDescription = 'A functional event space with';
        let elements = [];

        if (itemCounts.stage > 0) elements.push(`${itemCounts.stage} stage(s)`);
        if (itemCounts.danceFloor > 0) elements.push(`${itemCounts.danceFloor} dance floor(s)`);
        if (itemCounts.bar > 0) elements.push(`${itemCounts.bar} bar(s)`);
        if (itemCounts.table8ft > 0) elements.push(`${itemCounts.table8ft} 8ft tables`);
        if (itemCounts.table6ft > 0) elements.push(`${itemCounts.table6ft} 6ft tables`);
        if (itemCounts.table5ft > 0) elements.push(`${itemCounts.table5ft} round tables`);
        if (itemCounts.cocktailTable > 0) elements.push(`${itemCounts.cocktailTable} cocktail tables`);
        if (itemCounts.videoWall > 0) elements.push(`${itemCounts.videoWall} video wall(s)`);
        if (itemCounts.chair > 0) elements.push(`${itemCounts.chair} chairs`);

        const tentTypeDesc = tentStyle === 'marquee' ? 'marquee tent' : 'frame tent';
        const elementsText = elements.length > 0 ? elements.join(', ') : 'basic setup';

        const prompt = `Realistic photograph of an event inside a ${tentConfig.width}' x ${tentConfig.length}' ${tentTypeDesc} with ${elementsText}. Standard event lighting, practical decor with ${tentConfig.linenColor || 'white'} linens, ${attendees} guests present. Natural daylight mixed with standard uplighting. Actual venue photography style, authentic event setup, professional quality, no stylization.`;

        const response = await base44.integrations.Core.GenerateImage({ prompt });
        realisticImageToUse = response.url;
        setRealisticImage(realisticImageToUse);
      } catch (error) {
        console.error('Failed to generate realistic image for PDF:', error);
      }
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(88, 28, 135);
    pdf.text('Tent Design Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Project Details
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Project Details', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.text(`Project Name: ${projectName || 'Untitled'}`, 20, yPos);
    yPos += 6;
    pdf.text(`Category: ${projectCategory}`, 20, yPos);
    yPos += 6;
    pdf.text(`Attendees: ${attendees}`, 20, yPos);
    yPos += 6;
    pdf.text(`Seating: ${seatingArrangement?.replace('_', ' ') || 'N/A'}`, 20, yPos);
    yPos += 6;
    pdf.text(`Tent: ${tentConfig.width}' x ${tentConfig.length}' ${tentStyle}`, 20, yPos);
    yPos += 10;

    // Equipment List
    pdf.setFontSize(16);
    pdf.text('Equipment List', 20, yPos);
    yPos += 8;

    const itemCounts = {};
    items.forEach(item => {
      const key = item.type;
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    });

    pdf.setFontSize(10);
    
    // Add tent
    pdf.text(`• Tent: ${tentConfig.width}' x ${tentConfig.length}' ${tentStyle}`, 25, yPos);
    yPos += 6;

    // Add items
    Object.entries(itemCounts).forEach(([type, count]) => {
      const label = type.replace(/([A-Z])/g, ' $1').trim();
      pdf.text(`• ${label}: ${count}`, 25, yPos);
      yPos += 6;
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = 20;
      }
    });

    yPos += 5;

    // Add 2D Layout if available
    if (canvasRef.current && items.length > 0) {
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.text('2D Layout', 20, yPos);
      yPos += 10;

      try {
        const canvas = canvasRef.current;
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPos + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      } catch (error) {
        console.error('Error adding canvas to PDF:', error);
      }
    }

    // Add AI Generated Image (Dreamer) if available
    if (imageToUse) {
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(16);
      pdf.text('AI Dreamer Design', 20, yPos);
      yPos += 10;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageToUse;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const imgWidth = pageWidth - 40;
        const imgHeight = (img.height * imgWidth) / img.width;
        const maxHeight = pageHeight - 40;
        
        const finalHeight = Math.min(imgHeight, maxHeight);
        const finalWidth = (img.width * finalHeight) / img.height;

        pdf.addImage(imageToUse, 'JPEG', 20, yPos, finalWidth, finalHeight);
      } catch (error) {
        console.error('Error adding dreamer image to PDF:', error);
        pdf.text('(Dreamer image could not be loaded)', 20, yPos);
      }
    }

    // Add Realistic Image if available
    if (realisticImage) {
      pdf.addPage();
      yPos = 20;

      pdf.setFontSize(16);
      pdf.text('Realistic Rendering', 20, yPos);
      yPos += 10;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = realisticImage;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const imgWidth = pageWidth - 40;
        const imgHeight = (img.height * imgWidth) / img.width;
        const maxHeight = pageHeight - 40;
        
        const finalHeight = Math.min(imgHeight, maxHeight);
        const finalWidth = (img.width * finalHeight) / img.height;

        pdf.addImage(realisticImage, 'JPEG', 20, yPos, finalWidth, finalHeight);
      } catch (error) {
        console.error('Error adding realistic image to PDF:', error);
        pdf.text('(Realistic image could not be loaded)', 20, yPos);
      }
    }

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

    // Save PDF
    const fileName = `${projectName || 'tent-design'}-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      // Build detailed prompt based on items on canvas
      let equipmentDetails = [];
      const itemCounts = {};
      
      // Count items from canvas
      items.forEach(item => {
        itemCounts[item.type] = (itemCounts[item.type] || 0) + 1;
      });

      if (itemCounts.stage > 0) {
        equipmentDetails.push('glamorous professional stages with dramatic lighting and LED panels');
      }
      if (itemCounts.danceFloor > 0) {
        equipmentDetails.push('elegant dance floors with geometric LED patterns and dramatic uplighting');
      }
      if (itemCounts.bar > 0) {
        equipmentDetails.push('luxurious modern bars with backlit shelves and premium finishes');
      }
      if (itemCounts.table8ft > 0 || itemCounts.table6ft > 0 || itemCounts.table5ft > 0) {
        equipmentDetails.push(`elegant round and rectangular tables with ${tentConfig.linenColor || 'white'} linens, centerpieces with flowers and candles`);
      }
      if (itemCounts.videoWall > 0) {
        equipmentDetails.push('large LED video walls displaying elegant graphics');
      }
      if (itemCounts.cocktailTable > 0) {
        equipmentDetails.push('cocktail tables with ambient lighting');
      }
      if (itemCounts.chair > 0) {
        equipmentDetails.push('elegantly arranged seating throughout the space');
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

  const handleGenerateRealistic = async () => {
    setGeneratingRealistic(true);
    try {
      // Build prompt based on actual canvas items with average decor
      const itemCounts = {};
      items.forEach(item => {
        itemCounts[item.type] = (itemCounts[item.type] || 0) + 1;
      });

      let setupDescription = 'A functional event space with';
      let elements = [];

      if (itemCounts.stage > 0) elements.push(`${itemCounts.stage} stage(s)`);
      if (itemCounts.danceFloor > 0) elements.push(`${itemCounts.danceFloor} dance floor(s)`);
      if (itemCounts.bar > 0) elements.push(`${itemCounts.bar} bar(s)`);
      if (itemCounts.table8ft > 0) elements.push(`${itemCounts.table8ft} 8ft tables`);
      if (itemCounts.table6ft > 0) elements.push(`${itemCounts.table6ft} 6ft tables`);
      if (itemCounts.table5ft > 0) elements.push(`${itemCounts.table5ft} round tables`);
      if (itemCounts.cocktailTable > 0) elements.push(`${itemCounts.cocktailTable} cocktail tables`);
      if (itemCounts.videoWall > 0) elements.push(`${itemCounts.videoWall} video wall(s)`);
      if (itemCounts.chair > 0) elements.push(`${itemCounts.chair} chairs`);

      const tentTypeDesc = tentStyle === 'marquee' ? 'marquee tent' : 'frame tent';
      const elementsText = elements.length > 0 ? elements.join(', ') : 'basic setup';

      const prompt = `Realistic photograph of an event inside a ${tentConfig.width}' x ${tentConfig.length}' ${tentTypeDesc} with ${elementsText}. Standard event lighting, practical decor with ${tentConfig.linenColor || 'white'} linens, ${attendees} guests present. Natural daylight mixed with standard uplighting. Actual venue photography style, authentic event setup, professional quality, no stylization.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      setRealisticImage(response.url);
    } catch (error) {
      console.error('Failed to generate realistic image:', error);
    } finally {
      setGeneratingRealistic(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all items and start fresh.')) {
      setProjectName('');
      setAttendees(100);
      setSeatingArrangement('');
      setSuggestedTent(null);
      setTentStyle('marquee');
      setTentConfig({
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
      setItems([]);
      setGeneratedImage(null);
      setRealisticImage(null);
      setCurrentProjectId(null);
      setProjectCategory('Uncategorized');
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
        color: wall.color || '#1E90FF',
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
        color: bar.color || '#654321',
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
      const chairWidth = 1.5; // Chair width in feet
      const chairLength = 1.5; // Chair depth in feet
      const gapWithinRow = 0.5; // 6 inches gap between chairs in a row
      const aisleGap = 2; // 2 feet aisle between rows
      const chairSpacingX = chairWidth + gapWithinRow; // Spacing between chairs horizontally
      const chairSpacingY = chairLength + aisleGap; // Spacing between rows vertically
      const totalRowWidth = (perRow * chairWidth) + ((perRow - 1) * gapWithinRow);
      const startX = (tentLength - totalRowWidth) / 2;
      const startY = tentWidth * 0.15; // Row 1 at front
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < perRow; col++) {
          chairGroup.push({
            type: 'chair',
            width: 1.5,
            length: 1.5,
            x: startX + chairWidth / 2 + col * chairSpacingX,
            y: startY + row * chairSpacingY,
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
            {/* Project Name & Category */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <div>
                <Label className="text-sm font-semibold">Project Name</Label>
                <Input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Category</Label>
                <Input
                  type="text"
                  placeholder="Enter category (e.g., Wedding, Corporate)"
                  value={projectCategory}
                  onChange={(e) => setProjectCategory(e.target.value)}
                  list="categories"
                />
                <datalist id="categories">
                  {[...new Set(savedProjects.map(p => p.category).filter(Boolean))].map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
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
              {seatingArrangement === 'presentation' && (
                <div>
                  <Label className="text-sm font-semibold">Presentation Chairs</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-xs">Rows</Label>
                      <Input
                        type="number"
                        value={tentConfig.chairs.rows}
                        onChange={(e) => setTentConfig(prev => ({
                          ...prev,
                          chairs: { ...prev.chairs, rows: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Per Row</Label>
                      <Input
                        type="number"
                        value={tentConfig.chairs.perRow}
                        onChange={(e) => setTentConfig(prev => ({
                          ...prev,
                          chairs: { ...prev.chairs, perRow: parseInt(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSaveProject}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLoadModal(true)}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Load Project
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Everything
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                     className="bg-blue-600 hover:bg-blue-700"
                     onClick={handleGenerateImage}
                     disabled={items.length === 0 || generatingImage}
                   >
                     <Camera className="w-4 h-4 mr-2" />
                     {generatingImage ? 'Generating...' : 'Dreamer'}
                   </Button>
                   <Button
                     className="bg-indigo-600 hover:bg-indigo-700"
                     onClick={handleGenerateRealistic}
                     disabled={items.length === 0 || generatingRealistic}
                   >
                     <Camera className="w-4 h-4 mr-2" />
                     {generatingRealistic ? 'Generating...' : 'Realistic'}
                   </Button>
                </div>
                 <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleRender2D}>
                   2D Render
                 </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowGearList(true)}
                    disabled={items.length === 0}
                  >
                    Gear List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportPDF}
                    disabled={items.length === 0 || generatingImage || generatingRealistic}
                    className="bg-slate-50"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {generatingImage || generatingRealistic ? 'Generating...' : 'Export PDF'}
                  </Button>
                </div>
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

      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Load Project</h2>
                <Button variant="ghost" onClick={() => setShowLoadModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {savedProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved projects yet</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(categorizedProjects).map(([category, projects]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3 text-purple-700 border-b pb-2">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {projects.map((project) => (
                          <div 
                            key={project.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleLoadProject(project)}
                              >
                                <h4 className="font-semibold text-lg">{project.project_name}</h4>
                                <div className="text-sm text-gray-600 mt-2">
                                  <p>Attendees: {project.attendees}</p>
                                  <p>Arrangement: {project.seating_arrangement?.replace('_', ' ')}</p>
                                  <p>Tent: {project.tent_width}' x {project.tent_length}' {project.tent_style}</p>
                                  {project.version && <p className="text-purple-600 font-medium mt-1">Version: {project.version}</p>}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProjectForHistory(project);
                                  setShowVersionHistory(true);
                                }}
                                className="ml-3"
                              >
                                History
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVersionHistory && selectedProjectForHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Version History</h2>
                <Button variant="ghost" onClick={() => {
                  setShowVersionHistory(false);
                  setSelectedProjectForHistory(null);
                }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Project: <span className="font-semibold">{selectedProjectForHistory.project_name}</span>
              </p>
              {projectVersions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No version history available</p>
              ) : (
                <div className="space-y-3">
                  {projectVersions.map((version) => (
                    <div 
                      key={version.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleLoadVersion(version)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Version {version.version_number}</h4>
                          {version.description && (
                            <p className="text-sm text-gray-600 mt-1">{version.description}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            <p>Saved: {new Date(version.created_date).toLocaleString()}</p>
                            <p>Attendees: {version.attendees} • {version.tent_width}' x {version.tent_length}'</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadVersion(version);
                          }}
                        >
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}