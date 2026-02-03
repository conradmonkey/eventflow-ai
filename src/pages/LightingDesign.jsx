import ChatInterface from "@/components/chat/ChatInterface";
import { Lightbulb } from "lucide-react";

export default function LightingDesign() {
  return (
    <ChatInterface
      agentName="lighting_design"
      title="Lighting Design"
      icon={Lightbulb}
      color="from-yellow-500/20 to-yellow-600/10"
    />
  );
}