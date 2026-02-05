import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MessageBubble from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({ agentName, title, icon: Icon, color }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('eventLocation');
    const location = saved ? JSON.parse(saved) : null;
    
    if (!location || !location.city) {
      navigate(createPageUrl("Home") + "?locationRequired=true");
    }
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initConversation = async () => {
      const saved = localStorage.getItem('eventLocation');
      const location = saved ? JSON.parse(saved) : null;
      
      if (!location || !location.city) return;
      
      const newConversation = await base44.agents.createConversation({
        agent_name: agentName,
        metadata: { 
          name: title,
          country: location.country,
          province: location.province,
          city: location.city
        }
      });
      setConversation(newConversation);
      
      // Send initial message with location context
      const locationParts = [location.city, location.province, location.country].filter(Boolean);
      await base44.agents.addMessage(newConversation, {
        role: "user",
        content: `My event will be in ${locationParts.join(", ")}.`
      });
    };
    initConversation();
  }, [agentName, title]);

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    await base44.agents.addMessage(conversation, {
      role: "user",
      content: userMessage
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            to={createPageUrl("Home")} 
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
          
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            <p className="text-xs text-zinc-500">AI Assistant</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-6`}>
                <Icon className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                {title} Assistant
              </h2>
              <p className="text-zinc-400 max-w-md mx-auto">
                I'm here to help you plan the perfect setup. Tell me about your event and what you're envisioning.
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your event and what you need..."
              className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500/50 rounded-xl h-12"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium h-12 px-6 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}