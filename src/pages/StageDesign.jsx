import ChatInterface from "@/components/chat/ChatInterface";
import { Theater } from "lucide-react";

export default function StageDesign() {
  return (
    <ChatInterface
      agentName="stage_design"
      title="Stage Design"
      icon={Theater}
      color="from-amber-500/20 to-amber-600/10"
    />
  );
}