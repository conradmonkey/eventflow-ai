import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Loader2, MapPin, Users, DollarSign, Search, Save, FolderOpen, X, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jsPDF } from "jspdf";

export default function VenueScouting() {
  const [formData, setFormData] = useState({
    event_name: "",
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [searchName, setSearchName] = useState("");

  const queryClient = useQueryClient();
  const { data: savedSearches = [] } = useQuery({
    queryKey: ['venue-searches'],
    queryFn: () => base44.entities.VenueSearch.list('-updated_date')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    try {
      const prompt = `I'm looking for event venues for a ${formData.event_type} in ${formData.city}, ${formData.province}, ${formData.country}.
${formData.event_name ? `Event name: ${formData.event_name}` : ""}

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

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    try {
      await base44.entities.VenueSearch.create({
        search_name: searchName,
        event_name: formData.event_name,
        event_type: formData.event_type,
        capacity: formData.capacity,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        budget: formData.budget,
        requirements: formData.requirements,
        results: results
      });

      queryClient.invalidateQueries(['venue-searches']);
      setShowSaveModal(false);
      setSearchName("");
      alert('Search saved successfully!');
    } catch (error) {
      alert('Error saving search: ' + error.message);
    }
  };

  const handleLoadSearch = (search) => {
    setFormData({
      event_name: search.event_name || "",
      event_type: search.event_type,
      capacity: search.capacity,
      city: search.city,
      province: search.province,
      country: search.country,
      budget: search.budget,
      requirements: search.requirements || ""
    });
    setResults(search.results);
    setShowLoadModal(false);
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(168, 85, 247); // Purple
    pdf.text('Venue Recommendations', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Event Details
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Event Information', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    if (formData.event_name) {
      pdf.text(`Event Name: ${formData.event_name}`, margin, yPos);
      yPos += 6;
    }
    pdf.text(`Event Type: ${formData.event_type}`, margin, yPos);
    yPos += 6;
    pdf.text(`Capacity: ${formData.capacity}`, margin, yPos);
    yPos += 6;
    pdf.text(`Location: ${formData.city}, ${formData.province}, ${formData.country}`, margin, yPos);
    yPos += 6;
    pdf.text(`Budget: ${formData.budget}`, margin, yPos);
    yPos += 10;

    if (formData.requirements) {
      pdf.setFontSize(12);
      pdf.text('Requirements:', margin, yPos);
      yPos += 6;
      pdf.setFontSize(10);
      const reqLines = pdf.splitTextToSize(formData.requirements, pageWidth - 2 * margin);
      reqLines.forEach(line => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    }

    // Results
    pdf.setFontSize(14);
    pdf.text('Venue Recommendations', margin, yPos);
    yPos += 8;

    // Split results into lines and add to PDF
    pdf.setFontSize(10);
    const lines = pdf.splitTextToSize(results, pageWidth - 2 * margin);
    
    lines.forEach(line => {
      if (yPos > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
      pdf.text(line, margin, yPos);
      yPos += 5;
    });

    // Footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `venue-recommendations-${formData.city}-${Date.now()}.pdf`;
    pdf.save(fileName);
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
          <div className="mt-6">
            <Link 
              to={createPageUrl('Home')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white transition-colors"
            >
              Other AI Designers
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-zinc-300">Event Name (Optional)</Label>
              <Input
                value={formData.event_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, event_name: e.target.value }))
                }
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500/50 h-12 rounded-xl mt-2"
                placeholder="Summer Gala 2026"
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="md:col-span-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold h-14 rounded-xl text-lg"
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLoadModal(true)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-14 rounded-xl"
              >
                <FolderOpen className="w-5 h-5 mr-2" />
                Load Saved
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-6 h-6 text-purple-400" />
                Recommended Venues
              </h2>
              <div className="flex gap-3">
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>
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

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Save Search</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSaveModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300">Search Name</Label>
                  <Input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="e.g., Toronto Wedding Venues 2026"
                    className="bg-zinc-800 border-zinc-700 text-white mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSaveModal(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700 text-zinc-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveSearch}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Load Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Saved Searches</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLoadModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {savedSearches.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No saved searches yet</p>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      onClick={() => handleLoadSearch(search)}
                      className="border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <h4 className="font-semibold text-white mb-2">{search.search_name}</h4>
                      <div className="text-sm text-zinc-400 space-y-1">
                        {search.event_name && <p>Event: {search.event_name}</p>}
                        <p>Type: {search.event_type} • Capacity: {search.capacity}</p>
                        <p>Location: {search.city}, {search.province}, {search.country}</p>
                        <p>Budget: {search.budget}</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          Saved: {new Date(search.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}