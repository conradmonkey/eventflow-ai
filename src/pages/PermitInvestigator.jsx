import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileCheck, Loader2, MapPin, Search } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function PermitInvestigator() {
  const [formData, setFormData] = useState({
    event_name: "",
    province: "",
    city: "",
    features: {
      tent: false,
      stage: false,
      live_music: false,
      electrical: false,
      food_service: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    try {
      const features = Object.entries(formData.features)
        .filter(([_, checked]) => checked)
        .map(([key, _]) => key.replace(/_/g, " "));

      const prompt = `I'm planning an outdoor event in ${formData.city}, ${formData.province}. 
${formData.event_name ? `Event name: ${formData.event_name}` : ""}

Event features:
${features.length > 0 ? features.join(", ") : "Basic outdoor gathering"}

Please provide a comprehensive list of ALL permits and regulations I need to comply with at the federal, provincial/state, and municipal levels. Include:
1. Specific permit names and requirements
2. Which government department/office issues each permit
3. Typical costs and processing times
4. Any special requirements or conditions
5. Links to official government websites where available

Be thorough and specific to the location provided.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
      });

      setResults(response);
    } catch (error) {
      setResults("An error occurred while fetching permit information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureChange = (feature, checked) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: checked,
      },
    }));
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
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <FileCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Event Permit Assistant</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            AI-powered permit discovery for outdoor events across all government levels
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
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Event Details</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Provide information about your outdoor event
              </p>

              <div className="space-y-6">
                <div>
                  <Label className="text-zinc-300">Event Name (Optional)</Label>
                  <Input
                    value={formData.event_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, event_name: e.target.value }))
                    }
                    className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500/50 h-12 rounded-xl mt-2"
                    placeholder="Summer Festival 2026"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Province / State *
                    </Label>
                    <Input
                      required
                      value={formData.province}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, province: e.target.value }))
                      }
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500/50 h-12 rounded-xl mt-2"
                      placeholder="e.g., Ontario, California"
                    />
                  </div>

                  <div>
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Municipality / City *
                    </Label>
                    <Input
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500/50 h-12 rounded-xl mt-2"
                      placeholder="e.g., Toronto, Los Angeles"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Event Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Checkbox
                    id="tent"
                    checked={formData.features.tent}
                    onCheckedChange={(checked) => handleFeatureChange("tent", checked)}
                    className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="tent"
                    className="text-zinc-300 text-sm cursor-pointer flex-1"
                  >
                    🏕️ Tent or Temporary Structure
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Checkbox
                    id="stage"
                    checked={formData.features.stage}
                    onCheckedChange={(checked) => handleFeatureChange("stage", checked)}
                    className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="stage"
                    className="text-zinc-300 text-sm cursor-pointer flex-1"
                  >
                    🎭 Stage or Platform
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Checkbox
                    id="live_music"
                    checked={formData.features.live_music}
                    onCheckedChange={(checked) => handleFeatureChange("live_music", checked)}
                    className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="live_music"
                    className="text-zinc-300 text-sm cursor-pointer flex-1"
                  >
                    🎵 Live Music or Amplified Sound
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Checkbox
                    id="electrical"
                    checked={formData.features.electrical}
                    onCheckedChange={(checked) => handleFeatureChange("electrical", checked)}
                    className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="electrical"
                    className="text-zinc-300 text-sm cursor-pointer flex-1"
                  >
                    ⚡ Electrical Connections
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors md:col-span-2">
                  <Checkbox
                    id="food_service"
                    checked={formData.features.food_service}
                    onCheckedChange={(checked) => handleFeatureChange("food_service", checked)}
                    className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <label
                    htmlFor="food_service"
                    className="text-zinc-300 text-sm cursor-pointer flex-1"
                  >
                    🍽️ Food Service or Vendors
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold h-14 rounded-xl text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Required Permits
                </>
              )}
            </Button>
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
              <FileCheck className="w-6 h-6 text-blue-400" />
              Required Permits & Regulations
            </h2>
            <div className="prose prose-invert prose-zinc max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-white mt-5 mb-3">{children}</h2>
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
                      className="text-blue-400 hover:text-blue-300 underline"
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