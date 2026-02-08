import { Button } from '@/components/ui/button';
import { X, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Unlock Premium Features</h2>
        <p className="text-zinc-400 mb-6">
          Subscribe to save your projects and export PDFs. Generate stunning 3D renders and AI images are always free.
        </p>

        <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
          <div className="text-3xl font-bold text-amber-400 mb-1">$8<span className="text-lg text-zinc-400">/month</span></div>
          <p className="text-zinc-300 text-sm">Cancel anytime</p>
        </div>

        <ul className="space-y-3 mb-8 text-zinc-300 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Save & load unlimited projects
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Export to PDF
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            AI image generation (free)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            3D rendering (free)
          </li>
        </ul>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Continue Free
          </Button>
          <Button
            onClick={onSubscribe}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Subscribe Now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}