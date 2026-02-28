import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LayoutInputs from '@/components/layout/LayoutInputs';
import Canvas2DRenderer from '@/components/layout/Canvas2DRenderer';
import GearListModal from '@/components/layout/GearListModal';
import View3DRenderer from '@/components/layout/View3DRenderer';
import { Plus, Trash2, ZoomIn, ZoomOut, Save, FolderOpen, X, FileDown, Lightbulb, Loader2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { useSubscriptionStatus } from '@/components/useSubscriptionStatus';
import SubscriptionModal from '@/components/SubscriptionModal';
import AILayoutSuggestions from '@/components/AILayoutSuggestions';
import GuidedTour from '@/components/layout/GuidedTour';

export default function OutdoorLayoutPlanner() {
  const [projectName, setProjectName] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [scale, setScale] = useState(10); // feet per inch (always imperial internally)
  const [scaleUnit, setScaleUnit] = useState('imperial'); // 'imperial' or 'metric'
  const [imperialInches, setImperialInches] = useState(1);
  const [imperialFeet, setImperialFeet] = useState(10);
  const [metricCm, setMetricCm] = useState(1);
  const [metricMetres, setMetricMetres] = useState(3);

  // Convert metric ratio to feet per inch
  const metricToImperial = (cm, metres) => {
    // (metres * 3.28084) feet per (cm / 2.54) inches = (metres * 3.28084 * 2.54) / cm
    return (metres * 3.28084 * 2.54) / cm;
  };

  const handleMetricChange = (cm, metres) => {
    setMetricCm(cm);
    setMetricMetres(metres);
    setScale(metricToImperial(cm, metres));
  };

  const handleImperialChange = (inches, feet) => {
    setImperialInches(inches);
    setImperialFeet(feet);
    setScale(feet / inches);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showGearList, setShowGearList] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const exportBtnRef = useRef(null);

  useEffect(() => {
    window.onDeleteSelectedItem = (index) => {
      handleDeleteItem(index);
    };
    return () => {
      window.onDeleteSelectedItem = null;
    };
  }, [items]);

  const { isSubscribed } = useSubscriptionStatus();

  const queryClient = useQueryClient();
  const { data: savedProjects = [] } = useQuery({
    queryKey: ['outdoor-layout-projects'],
    queryFn: () => base44.entities.OutdoorLayoutProject.list('-updated_date')
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
        setTimeout(() => {
          exportBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItems = (newItems) => {
    setItems([...items, ...newItems]);
  };

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setSelectedItem(null);
  };

  const handleUpdateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  };

  const handleZoom = (direction) => {
    setZoom(prev => direction === 'in' ? prev * 1.2 : prev / 1.2);
  };

  const calculatePrice = () => {
    let total = 0;
    let details = {};

    items.forEach(item => {
      switch(item.type) {
        case 'tent_10x10':
          total += 79 * item.quantity;
          total += item.quantity * 4 * 4; // sandbags
          details['10x10 Tents'] = { qty: item.quantity, price: 79 * item.quantity };
          details['Sandbags for 10x10'] = { qty: item.quantity * 4, price: item.quantity * 4 * 4 };
          break;
        case 'tent_10x20':
          total += 110 * item.quantity;
          total += item.quantity * 6 * 4; // sandbags
          details['10x20 Tents'] = { qty: item.quantity, price: 110 * item.quantity };
          details['Sandbags for 10x20'] = { qty: item.quantity * 6, price: item.quantity * 6 * 4 };
          break;
        case 'tent_15x15':
          total += 350 * item.quantity;
          details['15x15 Marquee Tents'] = { qty: item.quantity, price: 350 * item.quantity };
          break;
        case 'tent_20x20':
          total += 450 * item.quantity;
          details['20x20 Marquee Tents'] = { qty: item.quantity, price: 450 * item.quantity };
          break;
        case 'tent_20x30':
          total += 750 * item.quantity;
          details['20x30 Marquee Tents'] = { qty: item.quantity, price: 750 * item.quantity };
          break;
        case 'video_wall':
          const sqFt = (item.width / 3.28084) * (item.height / 3.28084);
          total += 300 * sqFt * item.quantity;
          details['Video Walls'] = { qty: item.quantity, price: 300 * sqFt * item.quantity };
          break;
        case 'toilet':
          total += 189 * item.quantity;
          details['Portable Toilets'] = { qty: item.quantity, price: 189 * item.quantity };
          break;
        case 'handwash':
          total += 150 * item.quantity;
          details['Hand Wash Stations'] = { qty: item.quantity, price: 150 * item.quantity };
          break;
        case 'sink':
          total += 450 * item.quantity;
          details['Cooking Sinks'] = { qty: item.quantity, price: 450 * item.quantity };
          break;
        case 'stage':
          if (item.isSlage) {
            total += 5000 * item.quantity;
            details['SL 100 Stages'] = { qty: item.quantity, price: 5000 * item.quantity };
          } else {
            const stageSqFt = (item.width || 10) * (item.length || 10);
            total += 5 * stageSqFt * item.quantity;
            details['Custom Stages'] = { qty: item.quantity, price: 5 * stageSqFt * item.quantity };
          }
          break;
      }
    });

    return { total, details };
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      let bgImageUrl = '';

      // Upload background image to file storage if it's a local base64 blob
      if (backgroundImage && backgroundImage.startsWith('data:')) {
        const res = await fetch(backgroundImage);
        const blob = await res.blob();
        const file = new File([blob], 'background.png', { type: blob.type });
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        bgImageUrl = uploaded.file_url;
      } else if (backgroundImage) {
        bgImageUrl = backgroundImage; // already a URL from a previous save
      }

      const projectData = {
        project_name: projectName,
        scale,
        items,
        background_image: bgImageUrl,
        canvas_drawing: ''
      };

      if (currentProjectId) {
        await base44.entities.OutdoorLayoutProject.update(currentProjectId, projectData);
      } else {
        const newProject = await base44.entities.OutdoorLayoutProject.create(projectData);
        setCurrentProjectId(newProject.id);
      }

      queryClient.invalidateQueries(['outdoor-layout-projects']);
      setShowSaveModal(false);
      alert('Project saved successfully!');
    } catch (error) {
      alert('Error saving project: ' + error.message);
    }
  };

  const handleLoadProject = (project) => {
    setProjectName(project.project_name);
    setScale(project.scale || 10);
    setItems(project.items || []);
    setBackgroundImage(project.background_image || null);
    setCurrentProjectId(project.id);
    setShowLoadModal(false);
  };

  const handleGetAISuggestions = async () => {
    setAILoading(true);
    try {
      const itemTypes = items.map(item => `${item.quantity} x ${item.type}`).join(', ');
      const response = await base44.functions.invoke('getAILayoutSuggestions', {
        designType: 'outdoor',
        parameters: {
          eventType: projectName,
          attendeeCount: 'Not specified',
          scale,
          itemCount: items.length,
          itemTypes: itemTypes || 'No items'
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
    pdf.setTextColor(59, 130, 246);
    pdf.text('Outdoor Event Layout Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Project Details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Project Information', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    if (projectName) {
      pdf.text(`Project: ${projectName}`, margin, yPos);
      yPos += 6;
    }
    pdf.text(`Scale: 1 inch = ${scale} feet`, margin, yPos);
    yPos += 6;
    pdf.text(`Total Items: ${items.length}`, margin, yPos);
    yPos += 10;

    // Color Legend - only include types actually on the canvas
    const ITEM_COLORS = {
      tent_8x8: { color: [59, 130, 246], label: '8x8 Tent' },
      tent_10x10: { color: [59, 130, 246], label: '10x10 Tent' },
      tent_10x20: { color: [59, 130, 246], label: '10x20 Tent' },
      tent_15x15: { color: [59, 130, 246], label: '15x15 Tent' },
      tent_20x20: { color: [59, 130, 246], label: '20x20 Tent' },
      tent_20x30: { color: [59, 130, 246], label: '20x30 Tent' },
      tent_30x30: { color: [59, 130, 246], label: '30x30 Tent' },
      frame_tent: { color: [37, 99, 235], label: 'Frame Tent' },
      stage: { color: [239, 68, 68], label: 'Stage' },
      video_wall: { color: [30, 144, 255], label: 'Video Wall' },
      toilet: { color: [0, 0, 0], label: 'Toilet' },
      handwash: { color: [65, 105, 225], label: 'Handwash' },
      sink: { color: [32, 178, 170], label: 'Sink' },
    };

    const seen = new Map();
    items.forEach(item => {
      const info = ITEM_COLORS[item.type];
      if (info && !seen.has(info.label)) {
        // Use item's custom color if set
        const hexColor = item.color;
        let color = info.color;
        if (hexColor && hexColor.startsWith('#')) {
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          color = [r, g, b];
        }
        seen.set(info.label, { color, label: item.type === 'custom' ? (item.name || 'Custom') : info.label });
      } else if (item.type === 'custom' && !seen.has(item.name || 'Custom')) {
        const hexColor = item.color || '#808080';
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        seen.set(item.name || 'Custom', { color: [r, g, b], label: item.name || 'Custom' });
      }
    });

    const legend = Array.from(seen.values());

    if (legend.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Color Legend', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      legend.forEach(item => {
        pdf.setFillColor(...item.color);
        pdf.rect(margin, yPos - 3, 4, 4, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.text(item.label, margin + 6, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Items Summary
    if (items.length > 0) {
      pdf.setFontSize(14);
      pdf.text('Equipment List', margin, yPos);
      yPos += 8;

      // Count items by type
      const itemCounts = {};
      items.forEach(item => {
        const key = item.type;
        if (!itemCounts[key]) {
          itemCounts[key] = { count: 0, details: item };
        }
        itemCounts[key].count += 1;
      });

      pdf.setFontSize(10);
      Object.entries(itemCounts).forEach(([type, data]) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        
        let label = type.replace(/_/g, ' ').toUpperCase();
        if (type === 'frame_tent' && data.details.width && data.details.length) {
          label = `FRAME TENT ${data.details.width}x${data.details.length}`;
        } else if (type === 'stage' && data.details.width && data.details.length) {
          label = `STAGE ${data.details.width}x${data.details.length}`;
        } else if (type === 'video_wall' && data.details.width && data.details.height) {
          label = `VIDEO WALL ${data.details.width}x${data.details.height}`;
        }
        
        pdf.text(`• ${label}: ${data.count} unit${data.count > 1 ? 's' : ''}`, margin + 5, yPos);
        yPos += 6;
      });
      yPos += 5;
    }

    // Canvas Drawing
    if (canvasRef.current) {
      pdf.addPage();
      yPos = margin;

      pdf.setFontSize(14);
      pdf.text('Layout Drawing', margin, yPos);
      yPos += 10;

      const canvasImage = canvasRef.current.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvasRef.current.height * imgWidth) / canvasRef.current.width;

      pdf.addImage(canvasImage, 'PNG', margin, yPos, imgWidth, imgHeight);
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

    const fileName = `${projectName || 'outdoor-layout'}-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <GuidedTour />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Outdoor Event Planner</h1>
          <div className="mt-4">
            <Link 
              to={createPageUrl('Home')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 transition-colors shadow-sm"
            >
              Other AI Designers
            </Link>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-3 flex flex-col">
            {/* Image Upload & Scale */}
            <div className="bg-white rounded-lg shadow-md p-3 space-y-2">
              <div>
                <Label className="text-xs font-semibold">Background Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  id="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-8 text-xs mt-1"
                >
                  Upload Image
                </Button>
                {backgroundImage && (
                  <p className="text-xs text-green-600 mt-1">✓ Image uploaded</p>
                )}
              </div>
              <div id="scale-input">
                <Label className="text-xs font-semibold">Scale</Label>
                {/* Unit toggle */}
                <div className="flex gap-1 mt-1 mb-2">
                  <button
                    onClick={() => setScaleUnit('imperial')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${scaleUnit === 'imperial' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Imperial
                  </button>
                  <button
                    onClick={() => setScaleUnit('metric')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${scaleUnit === 'metric' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    Metric
                  </button>
                </div>

                {scaleUnit === 'imperial' ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Input
                      type="number"
                      value={imperialInches}
                      onChange={(e) => handleImperialChange(parseFloat(e.target.value) || 1, imperialFeet)}
                      min="0.01"
                      step="0.5"
                      className="w-14 h-7 text-xs"
                    />
                    <span className="text-xs text-slate-500">inch =</span>
                    <Input
                      type="number"
                      value={imperialFeet}
                      onChange={(e) => handleImperialChange(imperialInches, parseFloat(e.target.value) || 1)}
                      min="0.1"
                      step="1"
                      className="w-14 h-7 text-xs"
                    />
                    <span className="text-xs text-slate-500">feet</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Input
                        type="number"
                        value={metricCm}
                        onChange={(e) => handleMetricChange(parseFloat(e.target.value) || 1, metricMetres)}
                        min="0.01"
                        step="0.5"
                        className="w-14 h-7 text-xs"
                      />
                      <span className="text-xs text-slate-500">cm =</span>
                      <Input
                        type="number"
                        value={metricMetres}
                        onChange={(e) => handleMetricChange(metricCm, parseFloat(e.target.value) || 1)}
                        min="0.01"
                        step="1"
                        className="w-14 h-7 text-xs"
                      />
                      <span className="text-xs text-slate-500">metres</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      = 1 inch : <span className="font-medium text-slate-600">{scale.toFixed(2)} feet</span>
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Item Inputs */}
            <div id="add-items-section">
              <LayoutInputs onAddItems={handleAddItems} />
            </div>




          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2 space-y-3">
            <Canvas2DRenderer
              backgroundImage={backgroundImage}
              items={items}
              scale={scale}
              zoom={zoom}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              onUpdateItem={handleUpdateItem}
              canvasRef={canvasRef}
              showLegend={false}
            />
            {selectedItem !== null && (
              <Button
                variant="outline"
                className="w-full h-8 text-xs text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => handleDeleteItem(selectedItem)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Selected Item
              </Button>
            )}
            <Button
              ref={exportBtnRef}
              id="export-btn"
              onClick={handleExportPDF}
              className={`w-full gap-2 ${!isSubscribed ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <FileDown className="w-4 h-4" />
              Export PDF {!isSubscribed && <Lock className="w-3 h-3 ml-1" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGearList && (
        <GearListModal
          items={items}
          onClose={() => setShowGearList(false)}
          priceData={calculatePrice()}
        />
      )}

      {show3D && (
        <View3DRenderer
          items={items}
          scale={scale}
          onClose={() => setShow3D(false)}
        />
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {currentProjectId ? 'Update Project' : 'Save Project'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              {projectName ? `Saving: ${projectName}` : 'Please enter a project name'}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSaveModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={!projectName}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {currentProjectId ? 'Update' : 'Save'}
              </Button>
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
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Load Project</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLoadModal(false)}
                className="text-slate-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {savedProjects.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No saved projects yet</p>
            ) : (
              <div className="space-y-3">
                {savedProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoadProject(project)}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <h4 className="font-semibold text-slate-900 mb-2">{project.project_name}</h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p>Items: {project.items?.length || 0}</p>
                      <p>Scale: 1 inch = {project.scale} feet</p>
                      <p className="text-xs text-slate-500 mt-2">
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
  );
}