import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LayoutInputs from '@/components/layout/LayoutInputs';
import Canvas2DRenderer from '@/components/layout/Canvas2DRenderer';
import GearListModal from '@/components/layout/GearListModal';
import View3DRenderer from '@/components/layout/View3DRenderer';
import { Plus, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

export default function OutdoorLayoutPlanner() {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [scale, setScale] = useState(10); // feet per pixel
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [showGearList, setShowGearList] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Outdoor Event Planner</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Image Upload */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Label className="text-sm font-semibold">Background Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                Upload Image
              </Button>
              {backgroundImage && (
                <p className="text-xs text-green-600">✓ Image uploaded</p>
              )}
            </div>

            {/* Scale Input */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Label htmlFor="scale" className="text-sm font-semibold">
                Scale (feet per pixel)
              </Label>
              <Input
                id="scale"
                type="number"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value) || 10)}
                min="0.1"
                step="0.5"
              />
              <p className="text-xs text-slate-500">1 pixel = {scale} feet</p>
            </div>

            {/* Item Inputs */}
            <LayoutInputs onAddItems={handleAddItems} />

            {/* Render Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Render
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleZoom('in')}
              >
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleZoom('out')}
              >
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
              {items.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="w-full bg-purple-50 hover:bg-purple-100"
                    onClick={() => setShow3D(true)}
                  >
                    3D Render
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-green-50 hover:bg-green-100"
                    onClick={() => setShowGearList(true)}
                  >
                    Generate Gear List
                  </Button>
                </>
              )}
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-sm mb-3">Items ({items.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                        selectedItem === idx
                          ? 'bg-blue-100 border-l-4 border-blue-500'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                      onClick={() => setSelectedItem(idx)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{item.type}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(idx);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-slate-600">Qty: {item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Canvas2DRenderer
              backgroundImage={backgroundImage}
              items={items}
              scale={scale}
              zoom={zoom}
              selectedItem={selectedItem}
              onUpdateItem={handleUpdateItem}
              canvasRef={canvasRef}
            />
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
    </div>
  );
}