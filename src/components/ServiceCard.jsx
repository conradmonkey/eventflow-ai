import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ icon: Icon, title, description, href, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <Link to={createPageUrl(href)}>
        <div className="group relative h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-500 hover:bg-zinc-900/80">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-6 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition-all duration-500">
              <Icon className="w-7 h-7 text-amber-400" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-50 transition-colors">
              {title}
            </h3>
            
            <p className="text-zinc-400 leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
              {description}
            </p>
            
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <span className="text-sm">Start Planning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}