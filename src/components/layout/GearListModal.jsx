import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function GearListModal({ items, onClose, priceData }) {
  const { total, details } = priceData;

  const handleDownload = () => {
    let csv = 'Item,Quantity,Unit Price,Total\n';
    let grandTotal = 0;

    Object.entries(details).forEach(([item, data]) => {
      csv += `${item},${data.qty || 1},${data.price / (data.qty || 1)},${data.price}\n`;
      grandTotal += data.price;
    });

    csv += `\n\nGrand Total,,,${grandTotal}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gear-list.csv';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Equipment Gear List</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-2">Item</th>
                <th className="text-center p-2">Qty</th>
                <th className="text-right p-2">Unit Price</th>
                <th className="text-right p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(details).map(([item, data]) => (
                <tr key={item} className="border-b hover:bg-slate-50">
                  <td className="p-2">{item}</td>
                  <td className="text-center p-2">{data.qty || 1}</td>
                  <td className="text-right p-2">${((data.price) / (data.qty || 1)).toFixed(2)}</td>
                  <td className="text-right p-2 font-semibold">${data.price.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td colSpan="3" className="p-2 text-right">Grand Total:</td>
                <td className="text-right p-2">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
              Download CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}