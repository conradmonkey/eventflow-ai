import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, Loader2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AILayoutSuggestions({ isOpen, onClose, suggestions, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestions || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI Layout Suggestions</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-slate-600">Analyzing your design parameters...</p>
            </div>
          ) : suggestions ? (
            <div className="prose prose-sm prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>,
                  li: ({ children }) => <li className="text-slate-700 mb-2 ml-4">{children}</li>,
                  ul: ({ children }) => <ul className="list-disc mb-4">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal mb-4 ml-4">{children}</ol>,
                }}
              >
                {suggestions}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <p>No suggestions available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {suggestions && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={onClose}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Close
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}