import ChatInterface from "@/components/chat/ChatInterface";
import { FileCheck } from "lucide-react";

export default function PermitInvestigation() {
  return (
    <ChatInterface
      agentName="permit_investigation"
      title="Permit Investigation"
      icon={FileCheck}
      color="from-emerald-500/20 to-emerald-600/10"
    />
  );
}