import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TentInputPanel from '@/components/tent/TentInputPanel';
import TentCanvas2D from '@/components/tent/TentCanvas2D';

import TentGearList from '@/components/tent/TentGearList';
import { Sparkles, Plus, Camera, X, FileDown, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';

export default function TentDesignAssistant() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [projectName, setProjectName] = useState('');
  const [eventType, setEventType] = useState('');
  const [themeColors, setThemeColors] = useState('');
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

  const handleExportPDF = async () => {
    // Build shared layout description from items on canvas
    const buildLayoutDescription = () => {
      const itemCounts = {};
      items.forEach(item => { itemCounts[item.type] = (itemCounts[item.type] || 0) + 1; });
      const parts = [];
      if (itemCounts.stage > 0) parts.push(`${itemCounts.stage} stage${itemCounts.stage > 1 ? 's' : ''} positioned at the front/focal end`);
      if (itemCounts.danceFloor > 0) parts.push(`${itemCounts.danceFloor} dance floor${itemCounts.danceFloor > 1 ? 's' : ''} in the center`);
      if (itemCounts.bar > 0) parts.push(`${itemCounts.bar} bar${itemCounts.bar > 1 ? 's' : ''} along the perimeter`);
      if (itemCounts.table8ft > 0) parts.push(`${itemCounts.table8ft} rectangular 8ft banquet tables`);
      if (itemCounts.table6ft > 0) parts.push(`${itemCounts.table6ft} rectangular 6ft tables`);
      if (itemCounts.table5ft > 0) parts.push(`${itemCounts.table5ft} round 5ft tables`);
      if (itemCounts.cocktailTable > 0) parts.push(`${itemCounts.cocktailTable} cocktail tables scattered near entrances`);
      if (itemCounts.videoWall > 0) parts.push(`${itemCounts.videoWall} large LED video wall${itemCounts.videoWall > 1 ? 's' : ''} behind/near the stage`);
      if (itemCounts.chair > 0) parts.push(`${itemCounts.chair} chairs arranged in rows`);
      return parts.length > 0 ? parts.join(', ') : 'open floor plan';
    };

    const layoutDesc = buildLayoutDescription();
    const tentTypeDesc = tentStyle === 'marquee' ? 'marquee tent with peaked ceiling and draped fabric' : 'modern frame tent with high ceilings';
    const eventLabel = eventType ? eventType.replace(/_/g, ' ') : 'elegant event';
    const themeDesc = themeColors ? `Theme and color palette: ${themeColors}.` : '';

    // Generate Option 1 (realistic) if not already generated
    let realisticImageToUse = realisticImage;
    if (!realisticImageToUse) {
      try {
        const prompt = `Ultra-realistic professional event photograph. ${tentConfig.width}' x ${tentConfig.length}' ${tentTypeDesc} hosting a ${eventLabel}. ${themeDesc} Layout contains exactly: ${layoutDesc}. All items are placed in the positions matching a floor plan — stage at the front, tables arranged in the middle, bar on the side. Table linens are ${tentConfig.linenColor || 'white'}. ${attendees} guests present. Realistic venue photography, no CGI stylization, authentic lighting that matches the event theme and colors described.`;
        const response = await base44.integrations.Core.GenerateImage({ prompt });
        realisticImageToUse = response.url;
        setRealisticImage(realisticImageToUse);
      } catch (error) {
        console.error('Failed to generate Option 1 image for PDF:', error);
      }
    }

    // Generate Option 2 (AI dreamer) if not already generated
    let imageToUse = generatedImage;
    if (!imageToUse) {
      try {
        const prompt = `Stunning cinematic AI-rendered vision of a luxury ${eventLabel} inside a ${tentConfig.width}' x ${tentConfig.length}' ${tentTypeDesc}. ${themeDesc} The space is laid out with exactly: ${layoutDesc}. Stage is at the front focal point, tables fill the main floor area, bar lines the perimeter. Table linens are ${tentConfig.linenColor || 'white'}. Dramatic uplighting and atmospheric effects perfectly matching the theme colors. ${attendees} guests in elegant attire. Hyper-detailed 8K render, cinematic volumetric lighting, breathtaking event design, artistic and dreamlike yet true to the layout.`;
        const response = await base44.integrations.Core.GenerateImage({ prompt });
        imageToUse = response.url;
        setGeneratedImage(imageToUse);
      } catch (error) {
        console.error('Failed to generate Option 2 image for PDF:', error);
      }
    }

    // Extract the URL from realisticImage whether it's a string or object
    const realisticImageUrl = realisticImageToUse?.url || (typeof realisticImageToUse === 'string' ? realisticImageToUse : null);
    const option1Url = realisticImageUrl;
    const option2Url = imageToUse?.url || (typeof imageToUse === 'string' ? imageToUse : null);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(88, 28, 135);
    pdf.text('Tent Design Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Project Name (Prominent)
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`${projectName || 'Untitled Project'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Project Details
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    const detailsText = `${eventLabel.charAt(0).toUpperCase() + eventLabel.slice(1)} • ${seatingArrangement?.replace(/_/g, ' ') || 'N/A'} • ${attendees} Attendees • ${tentConfig.width}' x ${tentConfig.length}' ${tentStyle}`;
    pdf.text(detailsText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    pdf.setDrawColor(150, 150, 150);
    pdf.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // Equipment List (Gear List)
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Equipment List', 20, yPos);
    yPos += 8;

    const itemCounts = {};
    items.forEach(item => {
      const key = item.type;
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    });

    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    
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

    // Add 2D Layout if available
    if (canvasRef.current && items.length > 0) {
      yPos += 10;
      
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

    const subLabel = `${eventLabel.charAt(0).toUpperCase() + eventLabel.slice(1)} • ${tentConfig.width}' x ${tentConfig.length}' ${tentStyle}${themeColors ? ` • ${themeColors}` : ''}`;

    const addImagePage = async (url, title) => {
      if (!url) return;
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(18);
      pdf.setTextColor(88, 28, 135);
      pdf.text(title, 20, yPos);
      yPos += 7;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      // Wrap long subtitle
      const lines = pdf.splitTextToSize(subLabel, pageWidth - 40);
      pdf.text(lines, 20, yPos);
      pdf.setTextColor(0, 0, 0);
      yPos += lines.length * 5 + 5;
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        const imgWidth = pageWidth - 40;
        const imgHeight = (img.height * imgWidth) / img.width;
        const finalHeight = Math.min(imgHeight, pageHeight - yPos - 10);
        const finalWidth = (img.width * finalHeight) / img.height;
        pdf.addImage(url, 'JPEG', 20, yPos, finalWidth, finalHeight);
      } catch (error) {
        console.error(`Error adding ${title} to PDF:`, error);
        pdf.text(`(${title} image could not be loaded)`, 20, yPos);
      }
    };

    await addImagePage(option1Url, 'Option 1');
    await addImagePage(option2Url, 'Option 2');

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
      // Count items with their positions
      const itemCounts = {};
      const itemPositions = [];
      items.forEach(item => {
        itemCounts[item.type] = (itemCounts[item.type] || 0) + 1;
        const position = `${item.type} at (${Math.round(item.x)}, ${Math.round(item.y)}) with ${item.rotation || 0}° rotation`;
        itemPositions.push(position);
      });

      // Event type specific descriptions
      const eventDescriptions = {
        wedding: {
          mood: 'romantic and elegant',
          lighting: 'soft warm uplighting with fairy lights and chandeliers',
          colors: 'blush pink, ivory, and gold accents',
          decor: 'floral centerpieces, draped fabric ceiling, romantic ambiance'
        },
        conference: {
          mood: 'professional and modern',
          lighting: 'bright clean lighting with spotlights on presentation areas',
          colors: 'corporate blues, whites, and chrome accents',
          decor: 'branded signage, modern furniture, tech-forward setup'
        },
        presentation: {
          mood: 'focused and professional',
          lighting: 'bright even lighting with stage spotlights',
          colors: 'neutral tones with accent colors for branding',
          decor: 'clean lines, projection screens, organized seating'
        },
        celebration_of_life: {
          mood: 'warm and dignified',
          lighting: 'soft ambient lighting with gentle uplights',
          colors: 'warm earth tones, creams, and soft blues',
          decor: 'tasteful memorial displays, comfortable seating, photo arrangements'
        },
        workshop: {
          mood: 'collaborative and energizing',
          lighting: 'bright functional lighting with task lights',
          colors: 'vibrant accent colors with white base',
          decor: 'workstation setups, writable surfaces, creative displays'
        },
        film_screening: {
          mood: 'theatrical and immersive',
          lighting: 'dim ambient with accent lighting, focused on screen',
          colors: 'deep reds, blacks, theatrical gold accents',
          decor: 'cinema-style seating, large screen, sound system visible'
        },
        party: {
          mood: 'vibrant and energetic',
          lighting: 'dynamic colorful lighting with LED effects and dance floor lights',
          colors: 'bold vibrant colors with metallic accents',
          decor: 'festive decorations, balloon installations, energetic atmosphere'
        }
      };

      const eventSpec = eventDescriptions[eventType] || {
        mood: 'elegant and professional',
        lighting: 'warm ambient lighting with uplights',
        colors: 'coordinated color palette',
        decor: 'sophisticated event setup'
      };

      // Build equipment list
      let elements = [];
      if (itemCounts.stage > 0) elements.push(`professional stage with ${eventSpec.lighting}`);
      if (itemCounts.danceFloor > 0) elements.push('polished dance floor with ambient lighting');
      if (itemCounts.bar > 0) elements.push('elegant bar with backlit displays');
      if (itemCounts.table8ft > 0 || itemCounts.table6ft > 0 || itemCounts.table5ft > 0) {
        elements.push(`tables with ${tentConfig.linenColor || 'white'} linens and ${eventSpec.decor.split(',')[0]}`);
      }
      if (itemCounts.videoWall > 0) elements.push('LED video walls displaying event graphics');
      if (itemCounts.cocktailTable > 0) elements.push('cocktail tables with ambient lighting');
      if (itemCounts.chair > 0) elements.push('organized seating arrangements');
      if (itemCounts.customEquipment > 0) elements.push('custom event equipment');

      const tentTypeDesc = tentStyle === 'marquee' ? 'elegant marquee tent with draped ceiling' : 'modern frame tent with high ceilings';
      const elementsText = elements.length > 0 ? elements.join(', ') : 'elegant setup';

      const prompt = `Professional event photography of a ${eventType ? eventType.replace('_', ' ') : 'elegant'} event inside a ${tentConfig.width}' x ${tentConfig.length}' ${tentTypeDesc}.

Event Details:
- Type: ${eventType ? eventType.replace('_', ' ') : 'elegant event'}
- Tent: ${tentConfig.width}' x ${tentConfig.length}' ${tentStyle}
${themeColors ? `- Theme & Colors: ${themeColors}` : ''}
- Attendees: ${attendees}

CRITICAL - Exact Item Positions (match these precisely):
${itemPositions.join('\n')}

IMPORTANT: Render the tent with items positioned EXACTLY as specified in the coordinates above. The spatial arrangement and item locations are critical to the design.

Atmosphere & Design:
- ${eventSpec.mood.charAt(0).toUpperCase() + eventSpec.mood.slice(1)} atmosphere with ${elementsText}
${themeColors ? `- Color scheme matching theme: ${themeColors}` : `- Color scheme: ${eventSpec.colors}`}
- Lighting: ${eventSpec.lighting}
- Decor: ${eventSpec.decor}

High-quality event photography, realistic styling, professional setup, authentic venue aesthetic with exact spatial relationships matching the layout.`;

      const response = await base44.integrations.Core.GenerateImage({ prompt });
      
      // Generate comprehensive suggestions
      const suggestions = {
        lighting: generateLightingSuggestions(itemCounts, tentConfig, eventType, attendees),
        sound: generateSoundSuggestions(itemCounts, tentConfig, eventType, attendees),
        colorTone: generateColorSuggestions(eventType, tentConfig),
        layout: generateLayoutSuggestions(itemCounts, tentConfig, seatingArrangement, attendees)
      };

      setRealisticImage({ 
        url: response.url,
        suggestions 
      });
    } catch (error) {
      console.error('Failed to generate realistic image:', error);
      alert('Failed to generate design. Please try again.');
    } finally {
      setGeneratingRealistic(false);
    }
  };

  const generateLightingSuggestions = (itemCounts, config, eventType, attendees) => {
    const perimeter = (config.width * 2 + config.length * 2);
    const uplights = Math.ceil(perimeter / 10);
    const area = config.width * config.length;
    
    let suggestions = [];
    suggestions.push(`${uplights} LED uplights (spaced 10ft apart around perimeter)`);
    
    if (itemCounts.stage > 0) {
      suggestions.push('Stage wash: 4-6 LED PAR lights with color mixing');
      suggestions.push('2 spotlights for key presenters/performers');
    }
    
    if (itemCounts.danceFloor > 0) {
      suggestions.push('Dance floor: 4 moving head lights + LED strips');
    }
    
    if (itemCounts.table8ft > 0 || itemCounts.table6ft > 0 || itemCounts.table5ft > 0) {
      const tableCount = (itemCounts.table8ft || 0) + (itemCounts.table6ft || 0) + (itemCounts.table5ft || 0);
      suggestions.push(`${tableCount} pin spots for table centerpieces`);
    }
    
    if (area > 1200) {
      suggestions.push('2-3 chandeliers or overhead statement fixtures');
    }
    
    if (eventType === 'wedding') {
      suggestions.push('Romantic: Fairy light canopy, warm white (2700K)');
    } else if (eventType === 'conference') {
      suggestions.push('Professional: Bright white (4000K), even coverage');
    } else if (eventType === 'film_screening') {
      suggestions.push('Theatrical: Dim ambient, focus on screen area');
    }
    
    return suggestions.join('\n• ');
  };

  const generateSoundSuggestions = (itemCounts, config, eventType, attendees) => {
    const area = config.width * config.length;
    let suggestions = [];
    
    if (area < 800) {
      suggestions.push('2x 12" powered speakers (1000W each)');
    } else if (area < 1500) {
      suggestions.push('2x 15" powered speakers (1500W each)');
    } else {
      suggestions.push('4x 15" powered speakers with subwoofers');
    }
    
    if (itemCounts.stage > 0) {
      suggestions.push('4-channel mixer for stage inputs');
      suggestions.push('2 wireless handheld microphones');
      suggestions.push('1 wireless lavalier microphone');
    } else {
      suggestions.push('2-channel mixer');
      suggestions.push('1 wireless microphone for announcements');
    }
    
    if (eventType === 'workshop' || eventType === 'presentation') {
      suggestions.push('Powered monitor speakers for presenters');
    }
    
    if (eventType === 'wedding' || itemCounts.danceFloor > 0) {
      suggestions.push('DJ controller and music playback system');
    }
    
    suggestions.push(`Coverage: ${Math.ceil(attendees / 100)} speaker zones`);
    
    return suggestions.join('\n• ');
  };

  const generateColorSuggestions = (eventType, config) => {
    const colorSchemes = {
      wedding: {
        primary: 'Blush pink, ivory, champagne gold',
        accents: 'Soft rose gold metallics, white florals',
        linen: 'Ivory or blush table linens',
        lighting: 'Warm white (2700K) with soft amber uplights'
      },
      conference: {
        primary: 'Navy blue, crisp white, silver',
        accents: 'Corporate brand colors, modern chrome',
        linen: 'White or navy table linens',
        lighting: 'Cool white (4000K) with blue accent lighting'
      },
      presentation: {
        primary: 'Neutral grays, white, accent brand color',
        accents: 'Minimalist modern tones',
        linen: 'Clean white or light gray',
        lighting: 'Neutral white (3500K) even coverage'
      },
      celebration_of_life: {
        primary: 'Warm earth tones, cream, soft blue',
        accents: 'Natural wood, gentle florals',
        linen: 'Cream or soft beige',
        lighting: 'Warm white (2700K) gentle and respectful'
      },
      workshop: {
        primary: 'Vibrant accent colors, white base',
        accents: 'Energizing oranges, greens, blues',
        linen: 'White or bright solid colors',
        lighting: 'Bright white (4000K) energizing'
      },
      film_screening: {
        primary: 'Deep red, black, gold accents',
        accents: 'Theatrical draping, velvet textures',
        linen: 'Black or deep red',
        lighting: 'Dim amber (2200K) with focused spots'
      },
      party: {
        primary: 'Vibrant bold colors, metallics, neon accents',
        accents: 'Colorful balloons, festive banners, LED features',
        linen: 'Bright solid colors or metallic',
        lighting: 'Dynamic RGB (color-changing) with dance effects'
      }
    };
    
    const scheme = colorSchemes[eventType] || {
      primary: 'Elegant neutrals with coordinated accents',
      accents: 'Sophisticated metallics',
      linen: config.linenColor || 'White',
      lighting: 'Warm white (3000K) ambient'
    };
    
    return `Primary Colors: ${scheme.primary}\nAccent Elements: ${scheme.accents}\nTable Linens: ${scheme.linen}\nLighting Temperature: ${scheme.lighting}`;
  };

  const generateLayoutSuggestions = (itemCounts, config, arrangement, attendees) => {
    let suggestions = [];
    
    if (itemCounts.stage > 0) {
      suggestions.push('Position stage at focal point (typically short end of tent)');
      suggestions.push('Ensure 15-20ft clearance in front of stage for sightlines');
    }
    
    if (itemCounts.danceFloor > 0) {
      suggestions.push('Place dance floor in center or near stage for energy flow');
    }
    
    if (itemCounts.bar > 0) {
      suggestions.push('Position bar(s) at tent perimeter for easy access and flow');
      suggestions.push('Maintain 4ft clearance around bar for service');
    }
    
    if (arrangement === 'seated_5ft' || arrangement === 'seated_8ft' || arrangement === 'seated_6ft') {
      suggestions.push('Space tables 5-6ft apart for comfortable guest circulation');
      suggestions.push('Create clear aisles (min 4ft wide) to all exits and amenities');
    }
    
    if (arrangement === 'presentation') {
      suggestions.push('Arrange chairs in rows with center aisle (min 4ft)');
      suggestions.push('First row 8-10ft from stage for optimal viewing');
    }
    
    if (itemCounts.cocktailTable > 0) {
      suggestions.push('Scatter cocktail tables near entrance and bar areas');
    }
    
    suggestions.push(`Traffic flow: Ensure ${Math.ceil(attendees / 100)} main circulation paths`);
    suggestions.push('Emergency exits: Keep 2+ clear paths to tent exits at all times');
    
    if (config.width * config.length > 1500) {
      suggestions.push('Consider zoning: Create distinct areas for dining, socializing, and entertainment');
    }
    
    return suggestions.join('\n• ');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset everything? This will clear all items and start fresh.')) {
      setProjectName('');
      setEventType('');
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
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">AI Tent Design Visualizer</h1>
          </div>
          <Link 
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 transition-colors shadow-sm"
          >
            Other AI Designers
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Inputs */}
          <div className="col-span-1 lg:col-span-1 space-y-6">
            {/* Project Name & Event Type */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-2 gap-3">
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
                  <Label className="text-sm font-semibold">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="celebration_of_life">Celebration of Life</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="film_screening">Film Screening</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Theme and Colors</Label>
                  <Textarea
                    value={themeColors}
                    onChange={(e) => setThemeColors(e.target.value)}
                    placeholder="e.g., Romantic blush pink and gold with fairy lights"
                    className="resize-none mt-1"
                    rows={2}
                  />
                </div>
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
              <div className="mt-3 p-3 bg-purple-50 rounded-lg space-y-2">
                {/* Row 1: Suggested tent + Tent Style */}
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <p className="text-xs font-semibold text-purple-900">Suggested Tent</p>
                    <p className="text-base font-bold text-purple-700">{suggestedTent.type} ft</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Tent Style</Label>
                    <Select value={tentStyle} onValueChange={setTentStyle}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marquee">Marquee (Peaked)</SelectItem>
                        <SelectItem value="frame">Frame (Modern)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Row 2: Dimensions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Length (ft)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={tentConfig.length}
                      onChange={(e) => setTentConfig(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Width (ft)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={tentConfig.width}
                      onChange={(e) => setTentConfig(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                {/* Row 3: Presentation chairs (if needed) */}
                {seatingArrangement === 'presentation' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Chair Rows</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
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
                        className="h-8 text-xs"
                        value={tentConfig.chairs.perRow}
                        onChange={(e) => setTentConfig(prev => ({
                          ...prev,
                          chairs: { ...prev.chairs, perRow: parseInt(e.target.value) || 0 }
                        }))}
                      />
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

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Everything
                </Button>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleGenerateRealistic}
                  disabled={items.length === 0 || generatingRealistic}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {generatingRealistic ? 'Generating...' : 'A.I. Designer'}
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleRender2D}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Items
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={items.length === 0 || generatingRealistic}
                  className="w-full bg-slate-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  {generatingRealistic ? 'Generating...' : 'Export PDF'}
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

      {realisticImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-slate-900">A.I. Event Design</h3>
              <Button variant="ghost" size="icon" onClick={() => setRealisticImage(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Image */}
                <div className="flex items-center justify-center bg-slate-100 rounded-lg">
                  <img src={realisticImage.url || realisticImage} alt="A.I. generated design" className="max-w-full max-h-[70vh] rounded-lg shadow-lg" />
                </div>
                
                {/* Suggestions */}
                {realisticImage.suggestions && (
                  <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-bold text-amber-900 mb-2">💡 Lighting Suggestions</h4>
                      <p className="text-sm text-amber-800 whitespace-pre-line">• {realisticImage.suggestions.lighting}</p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-2">🔊 Sound Suggestions</h4>
                      <p className="text-sm text-blue-800 whitespace-pre-line">• {realisticImage.suggestions.sound}</p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-bold text-purple-900 mb-2">🎨 Color & Tone</h4>
                      <p className="text-sm text-purple-800 whitespace-pre-line">{realisticImage.suggestions.colorTone}</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-900 mb-2">📐 Layout Suggestions</h4>
                      <p className="text-sm text-green-800 whitespace-pre-line">• {realisticImage.suggestions.layout}</p>
                    </div>
                  </div>
                )}
              </div>
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