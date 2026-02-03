import ChatInterface from "@/components/chat/ChatInterface";
import { MonitorPlay } from "lucide-react";

export default function VideoWallDesign() {
  return (
    <ChatInterface
      agentName="video_wall_design"
      title="Video Wall Design"
      icon={MonitorPlay}
      color="from-violet-500/20 to-violet-600/10"
    />
  );
}