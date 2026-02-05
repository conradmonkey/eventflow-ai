import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MessageBubble from "./MessageBubble";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInterface({ agentName, title, icon: Icon, color }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [locationSet, setLocationSet] = useState(() => {
    const saved = localStorage.getItem('eventLocation');
    return !!saved;
  });
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('eventLocation');
    return saved ? JSON.parse(saved) : { country: "", province: "", city: "" };
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initConversation = async () => {
      if (!locationSet) return;
      
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
      if (location.city || location.province || location.country) {
        const locationParts = [location.city, location.province, location.country].filter(Boolean);
        await base44.agents.addMessage(newConversation, {
          role: "user",
          content: `My event will be in ${locationParts.join(", ")}.`
        });
      }
    };
    initConversation();
  }, [agentName, title, locationSet]);

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

  if (!locationSet) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
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

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 max-w-md w-full"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-6`}>
              <Icon className="w-8 h-8 text-amber-400" />
            </div>
            
            <h2 className="text-2xl font-semibold text-white text-center mb-2">
              Event Location
            </h2>
            <p className="text-zinc-400 text-center mb-8">
              Where will your event take place?
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Country</Label>
                <Input
                  value={location.country}
                  onChange={(e) => setLocation({ ...location, country: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                  placeholder="e.g., Canada"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Province/State</Label>
                <Input
                  value={location.province}
                  onChange={(e) => setLocation({ ...location, province: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                  placeholder="e.g., Ontario"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">City</Label>
                <Input
                  value={location.city}
                  onChange={(e) => setLocation({ ...location, city: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl"
                  placeholder="e.g., Toronto"
                />
              </div>

              <Button
                onClick={() => {
                  localStorage.setItem('eventLocation', JSON.stringify(location));
                  setLocationSet(true);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-14 rounded-xl text-lg mt-6"
              >
                Continue to Chat
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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