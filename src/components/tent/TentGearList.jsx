import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export default function TentGearList({ tentConfig, items, onClose }) {
  const gearList = {};

  // Count items
  items.forEach(item => {
    const key = item.type;
    if (!gearList[key]) {
      gearList[key] = { count: 0, name: key };
    }
    gearList[key].count++;
  });

  // Add tent
  gearList['tent'] = {
    count: 1,
    name: `Tent ${tentConfig.length}ft x ${tentConfig.width}ft`
  };

  const downloadCSV = () => {
    let csv = 'Item,Quantity\n';
    Object.values(gearList).forEach(item => {
      csv += `${item.name},${item.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tent-gear-list.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold">Gear List</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Item</th>
                <th className="text-right py-3 px-4">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(gearList).map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="text-right py-3 px-4">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t">
          <Button className="w-full" onClick={downloadCSV}>
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>
    </div>
  );
}