import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Loader2, MapPin, Users, DollarSign, Search } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function VenueScouting() {
  const [formData, setFormData] = useState({
    event_type: "",
    capacity: "",
    city: "",
    province: "",
    country: "",
    budget: "",
    requirements: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    try {
      const prompt = `I'm looking for event venues for a ${formData.event_type} in ${formData.city}, ${formData.province}, ${formData.country}.

Event Details:
- Expected capacity: ${formData.capacity} guests
- Budget: ${formData.budget}
${formData.requirements ? `- Additional requirements: ${formData.requirements}` : ""}

Please provide a comprehensive list of 5-8 suitable venue options that match these criteria. For each venue, include:
1. Venue name and type (e.g., hotel, convention center, outdoor space)
2. Location/address
3. Capacity range
4. Estimated pricing or rate range
5. Key features and amenities (parking, catering, AV equipment, etc.)
6. Contact information (phone, email, website)
7. Any notable details or special characteristics

Format the response in a clear, organized manner with venue names as headers. Use actual venues from the specified location with real information from current web sources.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
      });

      setResults(response);
    } catch (error) {
      setResults("An error occurred while searching for venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Venue Scouting Assistant</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            AI-powered venue discovery tailored to your event requirements
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-zinc-300">Event Type *</Label>
                <Input
                  required
                  value={formData.event_type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, event_type: e.target.value }))
                  }
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                  placeholder="Wedding, Conference, Concert, etc."
                />
              </div>

              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Expected Capacity *
                </Label>
                <Input
                  required
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                  }
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                  placeholder="e.g., 100, 200-250, 500+"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country *
                </Label>
                <Input
                  required
                  value={formData.country}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, country: e.target.value }))
                  }
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                  placeholder="Canada, USA, etc."
                />
              </div>

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
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                  placeholder="Ontario, California, etc."
                />
              </div>

              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  City *
                </Label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                  placeholder="Toronto, Los Angeles, etc."
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Range *
              </Label>
              <Input
                required
                value={formData.budget}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, budget: e.target.value }))
                }
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                placeholder="e.g., $5,000-$10,000, Under $20,000"
              />
            </div>

            <div>
              <Label className="text-zinc-300">
                Additional Requirements (Optional)
              </Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requirements: e.target.value }))
                }
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 min-h-24 rounded-xl mt-2 resize-none"
                placeholder="Any specific needs? e.g., outdoor space, on-site catering, AV equipment, parking..."
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold h-14 rounded-xl text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Venues
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
              <Building2 className="w-6 h-6 text-purple-400" />
              Recommended Venues
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
                      className="text-purple-400 hover:text-purple-300 underline"
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