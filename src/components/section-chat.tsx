"use client";

import { useState, useRef, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DocumentData } from "@/models/DocumentData";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface SectionChatProps {
    source: string;
    documentData: DocumentData;
    onDataUpdate: (updatedData: any) => void;
    selectedModel: string;
    disabled?: boolean;
    onChatStateChange?: (section: string, isActive: boolean) => void;
}

export default function SectionChat({
    source,
    documentData,
    onDataUpdate,
    selectedModel,
    disabled = false,
    onChatStateChange
}: SectionChatProps) {
    const t = useTranslations('Generate');
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const onChatStateChangeRef = useRef(onChatStateChange);

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

    // Send initial message when chat is opened
    useEffect(() => {
        if (isOpen && messages.length === 0 && !isLoading) {
            sendInitialMessage();
        }
    }, [isOpen]);

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
                    isInitial: true // Flag to indicate this is the initial message
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Add assistant message
            const assistantMessage: Message = {
                role: "assistant",
                content: data.message
            };
            setMessages([assistantMessage]);

            // Update the document data if the AI provided structured data
            if (data.updatedData) {
                onDataUpdate(data.updatedData);
            }
        } catch (error) {
            console.error("Initial chat error:", error);
            // Don't show error for initial message, just start with empty state
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getSectionTitle = (source: string): string => {
        const titleMap: Record<string, string> = {
            purposeOfDataProcessing: t("purposeOfDataProcessing"),
            technicalOrganizationalMeasures: t("technicalOrganizationalMeasures"),
            legalBasis: t("legalBasis"),
            dataSources: t("dataSources"),
            dataCategories: t("dataCategories"),
            personCategories: t("personCategories"),
            retentionPeriods: t("retentionPeriods"),
            additionalInfo: t("additionalInfo")
        };
        return titleMap[source] || source;
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
                    selectedModel
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get AI response");
            }

            const data = await response.json();

            // Add assistant message
            const assistantMessage: Message = {
                role: "assistant",
                content: data.message
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Update the document data if the AI provided structured data
            if (data.updatedData) {
                onDataUpdate(data.updatedData);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) {
        return (
            <CardContent>
                <Button
                    onClick={() => setIsOpen(true)}
                    disabled={disabled || !documentData.title}
                    className="w-full flex items-center gap-2"
                    variant="outline"
                >
                    <MessageSquare className="w-4 h-4" />
                    {t("chatWithAI") || "Chat with AI"}
                </Button>
            </CardContent>
        );
    }

    return (
        <CardContent>
            <div className="border rounded-lg overflow-hidden">
                {/* Chat Header */}
                <div className="bg-muted p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {t("chatAbout") || "Chat about"}: {getSectionTitle(source)}
                        </span>
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
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-background">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t("chatWelcome") || "Ask me anything about this section!"}</p>
                            <p className="mt-2 text-xs">
                                {t("chatHint") || "I can help you understand what information is needed and fill it out based on your answers."}
                            </p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg px-4 py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t bg-muted/30">
                    <div className="flex gap-2">
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
        </CardContent>
    );
}
