'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, X, MessageSquare, Loader2, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function CopilotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech API for Voice-to-Text
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/chat', {
        message: userMessage.content,
        history: messages
      });

      setMessages((prev) => [...prev, { role: 'model', content: res.data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert('Voice recognition is not supported in this browser.');
      }
    }
  };

  if (!user) return null; // Don't show copilot if not logged in

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="w-80 sm:w-96 shadow-2xl border-primary/20 flex flex-col h-[500px] overflow-hidden">
              <CardHeader className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b flex flex-row items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-1.5 rounded-lg">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">PowerGuard Copilot</CardTitle>
                    <p className="text-[10px] text-muted-foreground">AI Assistant for {user.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-950/50">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                    <Bot className="h-12 w-12" />
                    <p className="text-sm">Hi {user.firstName}! How can I assist you with the grid today?</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                    )}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 border border-slate-700 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Copilot is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <CardFooter className="p-3 bg-slate-900 border-t">
                <form 
                  className="flex w-full gap-2 items-center"
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                >
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-9 w-9 shrink-0", isListening && "text-red-500 bg-red-500/10")}
                    onClick={toggleListen}
                    title="Voice input"
                  >
                    {isListening ? <Mic className="h-4 w-4 animate-pulse" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Input
                    placeholder="Ask Copilot..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-slate-950 border-slate-800"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || loading} className="h-9 w-9 shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-transform hover:scale-105",
          isOpen ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  );
}
