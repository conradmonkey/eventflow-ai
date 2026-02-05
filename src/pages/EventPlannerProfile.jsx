import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, X, Save, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function EventPlannerProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    address: "",
    country: "",
    city: "",
    province: "",
    postal_code: "",
    photos: [],
    services: {
      stages: false,
      tents: false,
      power: false,
      tables_chairs: false,
      decor: false,
      lights: false,
      sound: false,
      city_permits: false,
      portable_sinks: false,
      fences: false,
      portable_toilets: false,
      book_talent: false,
    },
    contact_email: "",
    contact_phone: "",
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["eventPlannerProfile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.EventPlanner.filter({ created_by: user.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        business_name: profile.business_name || "",
        description: profile.description || "",
        address: profile.address || "",
        country: profile.country || "",
        city: profile.city || "",
        province: profile.province || "",
        postal_code: profile.postal_code || "",
        photos: profile.photos || [],
        services: profile.services || {
          stages: false,
          tents: false,
          power: false,
          tables_chairs: false,
          decor: false,
          lights: false,
          sound: false,
          city_permits: false,
          portable_sinks: false,
          fences: false,
          portable_toilets: false,
          book_talent: false,
        },
        contact_email: profile.contact_email || "",
        contact_phone: profile.contact_phone || "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return await base44.entities.EventPlanner.update(profile.id, data);
      } else {
        return await base44.entities.EventPlanner.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventPlannerProfile"] });
      toast.success("Profile saved successfully!");
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.photos.length >= 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, file_url],
      }));
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error("Failed to upload photo");
    }
    setUploadingPhoto(false);
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.description.split(/\s+/).length > 500) {
      toast.error("Description must be 500 words or less");
      return;
    }

    saveMutation.mutate(formData);
  };

  const services = [
    { key: "stages", label: "Stages" },
    { key: "tents", label: "Tents" },
    { key: "power", label: "Power" },
    { key: "tables_chairs", label: "Tables & Chairs" },
    { key: "decor", label: "Decor" },
    { key: "lights", label: "Lights" },
    { key: "sound", label: "Sound" },
    { key: "city_permits", label: "Obtain City Permits" },
    { key: "portable_sinks", label: "Portable Sinks" },
    { key: "fences", label: "Fences" },
    { key: "portable_toilets", label: "Portable Toilets" },
    { key: "book_talent", label: "Book Talent" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Event Planner Profile</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => base44.auth.logout()}
            className="text-zinc-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Business Information</h2>
              
              <div className="space-y-2">
                <Label className="text-zinc-300">Business Name *</Label>
                <Input
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                  placeholder="Your Business Name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Description * 
                  <span className="text-xs text-zinc-500 ml-2">
                    ({formData.description.split(/\s+/).filter(w => w).length} / 500 words)
                  </span>
                </Label>
                <Textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white min-h-48 rounded-xl resize-none"
                  placeholder="Describe your business, services, experience..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Country</Label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="Canada"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Province/State</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="Ontario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="Toronto"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Postal Code</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="M5H 2N2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="contact@business.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Contact Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Photos</h2>
              <p className="text-sm text-zinc-400">Upload up to 5 photos of your work</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                
                {formData.photos.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                        <span className="text-xs text-zinc-600">Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Services Provided</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service.key} className="flex items-center space-x-3 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                    <Checkbox
                      checked={formData.services[service.key]}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          services: { ...formData.services, [service.key]: checked },
                        })
                      }
                      className="border-zinc-700"
                    />
                    <label className="text-sm text-zinc-300 cursor-pointer flex-1">
                      {service.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 rounded-xl text-lg"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}