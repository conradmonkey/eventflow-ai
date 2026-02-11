import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import ChatInterface from "@/components/chat/ChatInterface";
import { Tent } from "lucide-react";

export default function TentDesign() {
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
        agentName="tent_design"
        title="Tent Design"
        icon={Tent}
        color="from-sky-500/20 to-sky-600/10"
      />
    </div>
  );
}