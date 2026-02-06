import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MonitorPlay, Loader2, MapPin, Ruler, Sparkles, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function VideoWallDesigner() {
  const [formData, setFormData] = useState({
    country: "",
    province: "",
    city: "",
    wall_height: "",
    wall_width: "",
    height_off_ground: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    try {
      const prompt = `I need to design an LED video wall setup for an event in ${formData.city}, ${formData.province}, ${formData.country}.

Video Wall Specifications:
- Wall Height: ${formData.wall_height} metres
- Wall Width: ${formData.wall_width} metres
- Height Off Ground: ${formData.height_off_ground} metres

Please provide a comprehensive technical plan including:

1. **Equipment List:**
   - LED panel specifications (pixel pitch, resolution recommendations)
   - Number of panels needed
   - Rigging and support structure requirements
   - Power distribution and cabling
   - Video processing equipment
   - Control systems

2. **Technical Drawing Description:**
   - Front elevation view with dimensions
   - Side view showing ground clearance
   - Support structure layout

3. **Setup Requirements:**
   - Installation time estimate
   - Crew size needed
   - Power requirements (in kW)
   - Load-bearing considerations

4. **Cost Estimate:**
   - Equipment rental ranges
   - Installation labor costs
   - Total project budget estimate

5. **Safety & Compliance:**
   - Structural engineering requirements
   - Safety certifications needed
   - Wind load considerations

Format the response clearly with headers and bullet points. Be specific and technical.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
      });

      setResults(response);
    } catch (error) {
      setResults("An error occurred while generating the video wall design. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      country: "",
      province: "",
      city: "",
      wall_height: "",
      wall_width: "",
      height_off_ground: "",
    });
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <MonitorPlay className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Video Wall Setup Designer</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Configure your LED video wall setup and generate a technical drawing with equipment list
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                LOCATION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Country</Label>
                  <Input
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, country: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Canada"
                  />
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">Province / State</Label>
                  <Input
                    required
                    value={formData.province}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, province: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Ontario"
                  />
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">City</Label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-cyan-500/50 h-11 rounded-lg mt-2"
                    placeholder="e.g., Toronto"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-cyan-400" />
                DIMENSIONS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm flex items-center gap-2">
                    <span className="text-cyan-400">↕</span> Wall Height (metres)
                  </Label>
                  <Select
                    value={formData.wall_height}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, wall_height: value }))
                    }
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="text-white">
                          {h}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm flex items-center gap-2">
                    <span className="text-cyan-400">↔</span> Wall Width (metres)
                  </Label>
                  <Select
                    value={formData.wall_width}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, wall_width: value }))
                    }
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select width" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((w) => (
                        <SelectItem key={w} value={w.toString()} className="text-white">
                          {w}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">Height Off Ground (metres)</Label>
                  <Select
                    value={formData.height_off_ground}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, height_off_ground: value }))
                    }
                    required
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 rounded-lg mt-2">
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700">
                      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((h) => (
                        <SelectItem key={h} value={h.toString()} className="text-white">
                          {h}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold h-12 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Drawing
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white h-12 rounded-lg px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <MonitorPlay className="w-6 h-6 text-cyan-400" />
              Technical Design & Equipment List
            </h2>
            <div className="prose prose-invert prose-zinc max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-white mt-5 mb-3 pb-2 border-b border-zinc-700">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-zinc-200 mt-4 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-zinc-300 leading-relaxed mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-zinc-300 space-y-2 mb-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                }}
              >
                {results}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}