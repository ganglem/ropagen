import { NextRequest, NextResponse } from "next/server";
import { callAPI } from "@/actions/actions";
import { DocumentData } from "@/models/DocumentData";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequest {
    source: string;
    documentData: DocumentData;
    messages: Message[];
    locale: string;
    selectedModel: string;
    isInitial?: boolean;
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { source, documentData, messages, locale, selectedModel, isInitial } = body;

        // Call the unified API function with messages parameter
        const result = await callAPI(
            documentData,
            locale,
            source,
            selectedModel,
            messages,
            isInitial
        );

        return NextResponse.json(result);

    } catch (error) {
        console.error('Section chat error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
