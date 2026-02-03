import ChatInterface from "@/components/chat/ChatInterface";
import { Tent } from "lucide-react";

export default function TentDesign() {
  return (
    <ChatInterface
      agentName="tent_design"
      title="Tent Design"
      icon={Tent}
      color="from-sky-500/20 to-sky-600/10"
    />
  );
}