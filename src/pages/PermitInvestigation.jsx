import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ChatInterface from "@/components/chat/ChatInterface";
import { FileCheck } from "lucide-react";

export default function PermitInvestigation() {
  return (
    <div>
      <div className="text-center py-6 bg-zinc-950">
        <Link 
          to={createPageUrl('Home')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white transition-colors"
        >
          Other AI Designers
        </Link>
      </div>
      <ChatInterface
        agentName="permit_investigation"
        title="Permit Investigation"
        icon={FileCheck}
        color="from-emerald-500/20 to-emerald-600/10"
      />
    </div>
  );
}