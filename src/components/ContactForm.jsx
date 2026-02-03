import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    event_type: "",
    event_date: "",
    budget_range: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await base44.entities.Inquiry.create(formData);
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">
          Request Received!
        </h3>
        <p className="text-zinc-400 max-w-md mx-auto">
          Thank you for reaching out. Our team will review your event details and contact you within 24-48 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-zinc-300">Full Name *</Label>
          <Input
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 h-12 rounded-xl"
            placeholder="John Smith"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Email *</Label>
          <Input
            required
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 h-12 rounded-xl"
            placeholder="john@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Phone</Label>
          <Input
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 h-12 rounded-xl"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Event Type *</Label>
          <Input
            required
            value={formData.event_type}
            onChange={(e) => handleChange("event_type", e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 h-12 rounded-xl"
            placeholder="Corporate conference, wedding, concert..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Event Date</Label>
          <Input
            type="date"
            value={formData.event_date}
            onChange={(e) => handleChange("event_date", e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 h-12 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-300">Budget Range</Label>
          <Select
            value={formData.budget_range}
            onValueChange={(value) => handleChange("budget_range", value)}
          >
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl">
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="under_10k">Under $10,000</SelectItem>
              <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
              <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
              <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
              <SelectItem value="over_100k">Over $100,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-300">Tell us about your event</Label>
        <Textarea
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-amber-500/50 min-h-32 rounded-xl resize-none"
          placeholder="Describe your vision, venue details, special requirements..."
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 rounded-xl text-lg"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Submit Request
          </>
        )}
      </Button>
    </form>
  );
}