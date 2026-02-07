import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MonitorPlay, Loader2, Download, Trash2, FolderOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const BOT_CONFIGS = {
  video_wall: { name: "Video Wall Design", icon: MonitorPlay, color: "cyan" },
  stage_design: { name: "Stage Design", icon: Sparkles, color: "purple" },
  tent_design: { name: "Tent Design", icon: Sparkles, color: "blue" },
  sound_design: { name: "Sound Design", icon: Sparkles, color: "green" },
  lighting_design: { name: "Lighting Design", icon: Sparkles, color: "amber" }
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects', selectedBot],
    queryFn: async () => {
      const filter = selectedBot ? { bot_type: selectedBot, created_by: user?.email } : { created_by: user?.email };
      return await base44.entities.Project.filter(filter, '-last_modified');
    },
    enabled: !!user
  });

  const { data: outputs = [] } = useQuery({
    queryKey: ['outputs', selectedProject],
    queryFn: async () => {
      return await base44.entities.SavedOutput.filter({ 
        project_id: selectedProject,
        created_by: user?.email 
      }, '-created_date');
    },
    enabled: !!selectedProject && !!user
  });

  const handleDownload = async (output) => {
    if (output.file_url) {
      const link = document.createElement('a');
      link.href = output.file_url;
      link.download = output.file_name || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (output.data) {
      const blob = new Blob([JSON.stringify(output.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = output.file_name || 'data.json';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (confirm('Delete this project and all its outputs?')) {
      await base44.entities.Project.delete(projectId);
      const projectOutputs = await base44.entities.SavedOutput.filter({ project_id: projectId });
      await Promise.all(projectOutputs.map(o => base44.entities.SavedOutput.delete(o.id)));
      refetchProjects();
      if (selectedProject === projectId) setSelectedProject(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-zinc-400">Welcome back, {user.full_name}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bots List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">AI Assistants</h2>
              <div className="space-y-2">
                <button
                  onClick={() => { setSelectedBot(null); setSelectedProject(null); }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    !selectedBot ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  All Projects
                </button>
                {Object.entries(BOT_CONFIGS).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => { setSelectedBot(key); setSelectedProject(null); }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedBot === key ? `bg-${config.color}-500/20 text-${config.color}-400` : 'text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {config.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Projects List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-cyan-400" />
                {selectedBot ? BOT_CONFIGS[selectedBot].name : 'All Projects'}
              </h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500 mb-4">No projects yet</p>
                  <Link to={createPageUrl('Home')}>
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      Create Your First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedProject === project.id
                          ? 'bg-zinc-800 border-cyan-500'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-semibold">{project.name}</h3>
                          <p className="text-zinc-400 text-sm mt-1">
                            {BOT_CONFIGS[project.bot_type]?.name}
                          </p>
                          <p className="text-zinc-500 text-xs mt-1">
                            {new Date(project.last_modified || project.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Outputs for Selected Project */}
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="bg-zinc-900/50 border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Saved Outputs</h2>
              
              {outputs.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No saved outputs for this project</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outputs.map((output) => (
                    <div
                      key={output.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-medium">{output.file_name || output.output_type}</p>
                          <p className="text-zinc-500 text-xs mt-1">
                            {new Date(output.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {output.file_url && (
                        <img 
                          src={output.file_url} 
                          alt={output.file_name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      
                      <Button
                        onClick={() => handleDownload(output)}
                        className="w-full bg-cyan-500 hover:bg-cyan-600"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}