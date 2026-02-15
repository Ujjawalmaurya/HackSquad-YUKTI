"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Mic, Maximize2, Minimize2, Trash2, Zap, Cloud, Droplets, Activity, Map, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAI } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | 'action';
    actions?: { label: string; value: string; icon: any }[];
}

import { usePathname } from 'next/navigation';

export default function Chatbot() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);


    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I am your Sky Scouts AI assistant. I can help you monitor crop health, analyze NDVI maps, or schedule drone missions. What's on your mind today?",
            timestamp: new Date(),
            type: 'text',
            actions: [
                { label: 'Check Farm Health', value: 'How is my farm health?', icon: Activity },
                { label: 'Drone Status', value: 'What is the drone status?', icon: Zap },
                { label: 'Weather Report', value: 'Current weather?', icon: Cloud }
            ]
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const checkHealth = async () => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiBase}/`);
            setIsOnline(res.ok);
        } catch {
            setIsOnline(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            checkHealth();
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const suggestedQuestions = [
        "How is my crop health?",
        "Any pest alerts?",
        "Drone flight status",
        "Weather update"
    ];

    const handleSend = async (customMessage?: string) => {
        const textToSend = customMessage || input;
        if (!textToSend.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithAI(userMessage.content);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
                actions: response.actions?.map((a: any) => ({
                    ...a,
                    icon: a.label.includes('Fly') || a.label.includes('Launch') ? Zap :
                        a.label.includes('Map') || a.label.includes('NDVI') ? Map :
                            a.label.includes('Weather') ? Cloud :
                                a.label.includes('Alerts') || a.label.includes('Pest') ? AlertTriangle :
                                    Activity
                }))
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to the Sky Scout brain. Please ensure the backend server is running.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        className="fixed bottom-24 right-6 w-[380px] md:w-[420px] h-[600px] glass rounded-[2.5rem] border border-white/20 shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-3xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-primary/20 to-accent/20 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transform rotate-3">
                                        <Bot className="w-7 h-7 text-black -rotate-3" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-foreground text-lg tracking-tight">Sky Scout AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${isOnline === true ? 'bg-green-500 animate-pulse' : isOnline === false ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        <span className="text-xs font-medium text-foreground/50">
                                            {isOnline === true ? 'AI Engine Online' : isOnline === false ? 'AI Engine Offline' : 'Connecting...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMessages([{
                                        id: '1',
                                        role: 'assistant',
                                        content: 'Chat cleared. How can I assist you now?',
                                        timestamp: new Date()
                                    }])}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all"
                                    title="Clear Chat"
                                >
                                    <Trash2 className="w-5 h-5 text-foreground/40" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
                                >
                                    <X className="w-6 h-6 text-foreground/60" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none bg-gradient-to-b from-transparent to-primary/5">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                                    <div className="flex items-center gap-2">
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                                <Bot className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary text-black rounded-tr-none font-semibold shadow-lg shadow-primary/20'
                                                : 'bg-white/5 text-foreground rounded-tl-none border border-white/10 backdrop-blur-xl'
                                                }`}
                                        >
                                            {msg.content}
                                            <div className={`text-[10px] mt-2 flex items-center gap-1 ${msg.role === 'user' ? 'text-black/40' : 'text-foreground/30'}`}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                                                <User className="w-4 h-4 text-accent" />
                                            </div>
                                        )}
                                    </div>

                                    {msg.actions && (
                                        <div className="flex flex-wrap gap-2 mt-2 ml-10">
                                            {msg.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSend(action.value)}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-primary hover:text-black transition-all"
                                                >
                                                    {action.icon && <action.icon className="w-3 h-3" />}
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10 flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-xs font-medium text-foreground/50">Processing your data...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestions */}
                        {!isLoading && messages.length < 5 && (
                            <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-none no-scrollbar">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium hover:bg-primary hover:text-black hover:border-primary transition-all active:scale-95"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-6 pt-2">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                                <div className="relative flex items-center bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                    <button
                                        className="p-3 text-foreground/40 hover:text-primary transition-colors"
                                        title="Voice Input (Coming Soon)"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask about your farm..."
                                        className="w-full bg-transparent px-2 py-4 text-sm focus:outline-none text-foreground placeholder:text-foreground/30"
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim() || isLoading}
                                        className="mr-2 p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-black rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center z-50 group border border-white/20 transition-all duration-300"
            >
                {isOpen ? (
                    <X className="w-8 h-8" />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Bot className="w-8 h-8 group-hover:opacity-0 transition-opacity absolute" />
                        <Sparkles className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity absolute" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                    </div>
                )}
            </motion.button>
        </>
    );
}
