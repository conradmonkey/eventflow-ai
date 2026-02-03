import ChatInterface from "@/components/chat/ChatInterface";
import { Volume2 } from "lucide-react";

export default function SoundDesign() {
  return (
    <ChatInterface
      agentName="sound_design"
      title="Sound Design"
      icon={Volume2}
      color="from-rose-500/20 to-rose-600/10"
    />
  );
}