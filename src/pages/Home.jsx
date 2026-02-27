import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Theater, 
  FileCheck,
  Tent, 
  MonitorPlay,
  Map,
  Building2,
  Sparkles,
  ArrowRight,
  Grid3x3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ServiceCard from "@/components/ServiceCard";
import { base44 } from "@/api/base44Client";


const services = [

  {
    icon: Tent,
    title: "AI Tent Design Visualizer",
    description: "Design perfect tent layouts with AI-powered size suggestions and elegant 2D/3D visualizations.",
    href: "TentDesignAssistant",
  },
  {
    icon: Sparkles,
    title: "AI Room Decor Designer",
    description: "Create elegant room layouts with professional 2D floor plans and stunning 3D renders.",
    href: "RoomDesigner",
  },
  {
    icon: FileCheck,
    title: "Permit Investigation",
    description: "Navigate permits and regulations with AI assistance for noise, assembly, and vendor requirements.",
    href: "PermitInvestigator",
  },
  {
    icon: Building2,
    title: "Venue Scouting",
    description: "Find perfect venues tailored to your event type, capacity, location, and budget requirements.",
    href: "VenueScouting",
  },
  {
    icon: Grid3x3,
    title: "Outdoor Event Planner",
    description: "Perfect for planning outdoor festivals—design 2D and 3D layouts with tents, stages, video walls, and more.",
    href: "OutdoorLayoutPlanner",
  },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthenticated);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Canadian Flag */}
        <div className="absolute top-8 right-8 text-4xl opacity-30 hover:opacity-100 transition-opacity">
          🇨🇦
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-200">AI-Powered Event Planning</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="text-sm text-green-300 font-semibold">✓ Free to Use</span>
              </div>
            </div>


            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Bring Your Event
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Vision to Life
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Specialized AI assistants to help you plan every technical aspect of your event—from stage design to lighting, sound to permits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 px-8 rounded-xl text-lg"
              >
                <a href="#services">
                  Explore AI Assistants
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>


            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-amber-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Events Gallery */}
      <section className="py-16 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative h-64 rounded-2xl overflow-hidden group"
            >
              <img 
                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800" 
                alt="Outdoor event with stage"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative h-64 rounded-2xl overflow-hidden group"
            >
              <img 
                src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800" 
                alt="Concert with lighting"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative h-64 rounded-2xl overflow-hidden group"
            >
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800" 
                alt="Festival with tents"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative h-64 rounded-2xl overflow-hidden group"
            >
              <img 
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800" 
                alt="Outdoor wedding event"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">AI Planning Assistants</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Each assistant is specialized in their domain, ready to help you plan and optimize every detail.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={service.href}
                {...service}
                delay={index * 0.1}
                external={service.external}
              />
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Event Planning AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}