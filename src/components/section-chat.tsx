"use client";

import { useState, useRef, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DocumentData } from "@/models/DocumentData";
import ShinyText from "@/components/ui/ShinyText";
import { marked } from "marked";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

interface SectionChatProps {
    source: string;
    documentData: DocumentData;
    onDataUpdate?: (updatedData: any) => void;
    selectedModel: string;
    chatMode: string;
    disabled?: boolean;
    onChatStateChange?: (section: string, isActive: boolean) => void;
}

export default function SectionChat({
    source,
    documentData,
    onDataUpdate,
    selectedModel,
    chatMode,
    disabled = false,
    onChatStateChange
}: SectionChatProps) {
    const t = useTranslations('Generate');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const onChatStateChangeRef = useRef(onChatStateChange);
    const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Configure marked for inline parsing
    useEffect(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
        });
    }, []);

    // Update ref when callback changes
    useEffect(() => {
        onChatStateChangeRef.current = onChatStateChange;
    }, [onChatStateChange]);

    // Notify parent when chat state changes
    useEffect(() => {
        if (onChatStateChangeRef.current) {
            onChatStateChangeRef.current(source, isLoading);
        }
    }, [isLoading, source]);

    // Cleanup streaming interval on unmount
    useEffect(() => {
        return () => {
            if (streamingIntervalRef.current) {
                clearInterval(streamingIntervalRef.current);
            }
        };
    }, []);

    // Send initial message when chat is opened
    useEffect(() => {
        if (isOpen && messages.length === 0 && !isLoading) {
            sendInitialMessage();
        }
    }, [isOpen]);

    const streamText = (text: string, callback: (updatedData: any) => void) => {
        let currentIndex = 0;
        setStreamingContent("");

        // Clear any existing interval
        if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
        }

        // Add a placeholder message that will be updated
        const placeholderMessage: Message = {
            role: "assistant",
            content: "",
            isStreaming: true
        };
        setMessages(prev => [...prev, placeholderMessage]);

        streamingIntervalRef.current = setInterval(() => {
            if (currentIndex < text.length) {
                // Stream 2-3 characters at a time for a faster, more natural feel
                const charsToAdd = Math.min(3, text.length - currentIndex);
                const newContent = text.slice(0, currentIndex + charsToAdd);
                currentIndex += charsToAdd;

                setStreamingContent(newContent);

                // Update the last message with the current streamed content
                setMessages(prev => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]?.isStreaming) {
                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: newContent,
                            isStreaming: true
                        };
                    }
                    return updated;
                });
            } else {
                // Streaming complete
                if (streamingIntervalRef.current) {
                    clearInterval(streamingIntervalRef.current);
                    streamingIntervalRef.current = null;
                }

                // Finalize the message
                setMessages(prev => {
                    const updated = [...prev];
                    if (updated[updated.length - 1]?.isStreaming) {
                        updated[updated.length - 1] = {
                            role: "assistant",
                            content: text,
                            isStreaming: false
                        };
                    }
                    return updated;
                });

                setStreamingContent("");
                setIsLoading(false);

                // Call the callback after streaming is complete
                callback(null);
            }
        }, 20); // 20ms delay between character chunks for smooth streaming
    };

    const sendInitialMessage = async () => {
        setIsLoading(true);

        try {
            // Call the API with empty messages to get initial greeting and suggestions
            const response = await fetch("/api/section-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source,
                    documentData,
                    messages: [],
                    locale: t("locale"),
                    selectedModel,
                    chatMode,
                    isInitial: true // Flag to indicate this is the initial message
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Stream the assistant message
            streamText(data.message, (error) => {
                // Update the document data if the AI provided structured data
                if (data.updatedData && onDataUpdate) {
                    onDataUpdate(data.updatedData);
                }
            });
        } catch (error) {
            console.error("Initial chat error:", error);
            // Don't show error for initial message, just start with empty state
            setMessages([]);
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the API with the conversation context
            const response = await fetch("/api/section-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source,
                    documentData,
                    messages: [...messages, userMessage],
                    locale: t("locale"),
                    chatMode,
                    selectedModel
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Stream the assistant message
            streamText(data.message, (error) => {
                // Update the document data if the AI provided structured data
                if (data.updatedData && onDataUpdate) {
                    onDataUpdate(data.updatedData);
                }
            });
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const parseMarkdown = (text: string) => {
        try {
            const html = marked.parse(text, { async: false }) as string;
            return html;
        } catch (error) {
            console.error("Markdown parsing error:", error);
            return text;
        }
    };

    if (!isOpen) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="w-full">
                        <Button
                            onClick={() => setIsOpen(true)}
                            disabled={disabled || !documentData.title}
                            className="w-full flex items-center gap-2"
                            variant="outline"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {t("chatWithAI") || "Chat with AI"}
                        </Button>
                    </span>
                </TooltipTrigger>
                {!documentData.title && (
                    <TooltipContent side="top">
                        <p>{t("aiSuggestTooltip")}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        );
    }

    return (

        <div className="rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-background backdrop-blur-[2px] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-background border border-border rounded-xl">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t("chatWelcome") || "Ask me anything about this section!"}</p>
                        <p className="mt-2 text-xs">
                            {t("chatHint") || "I can help you understand what information is needed and fill it out based on your answers."}
                        </p>
                    </div>
                )}
                {messages.filter(msg => !msg.isStreaming || msg.content.length > 0).map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground [&_*]:!text-primary-foreground"
                                    : "bg-muted text-foreground"
                            }`}
                        >
                            <div
                                className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                            />
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.isStreaming !== true && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-full px-4 py-2 flex items-center gap-2">
                            <ShinyText text="🧠" className="text-sm" />
                            <ShinyText text={t("thinking") || "Thinking"} className="text-sm" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>


            {/* Input */}
            <div className="p-3 bg-background backdrop-blur-[2px]">
                <div className="flex gap-2 ">
                    <Input
                        placeholder={t("chatPlaceholder") || "Type your message..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading || disabled}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim() || disabled}
                        size="icon"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>

    );
}
