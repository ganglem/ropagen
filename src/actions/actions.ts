"use server";

import {DocumentData, Template} from "@/models/DocumentData";
import {generateText} from "ai";
import {defaultModel} from "@/config/models";
import {createOpenRouter} from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || '',
})

export async function fetchMockTemplates(locale: string = "en"): Promise<Template[]> {
    // Dynamically import the correct mock-<locale>.json file
    const templates = await import(`../../data/mock-${locale}.json`).then(mod => mod.default);
    return templates as unknown as Template[];
}

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export async function callAPI(
    data: DocumentData,
    locale: string,
    source: string,
    selectedModel: string = defaultModel,
    chatMode: string = "",
    messages?: ChatMessage[],
    isInitial?: boolean,
): Promise<any> {
    try {
        const prompt = await generatePromptFromData(data, locale, source, chatMode, messages, isInitial);

        let llmResponse = "";

        // If messages are provided, include conversation in prompt
        let fullPrompt = prompt;
        if (messages && messages.length > 0) {
            const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
            fullPrompt = `${prompt}\n\nConversation:\n${conversationText}\n\nassistant:`;
        }

        const response = await generateText({
            model: openrouter(selectedModel),
            prompt: fullPrompt,
            temperature: messages && messages.length > 0 ? 0.7 : 0,
        });
        llmResponse = response.text || '';

        console.log(response)

        try {
            if (source == "finalropa") {
                return true ? llmResponse : String(llmResponse);
            } else if (messages !== undefined) {
                // Chat mode (including initial message): return both message and structured data
                const { message, updatedData } = parseChatResponse(llmResponse);

                return {
                    message: message,
                    updatedData: updatedData
                };
            } else {
                // AI suggestion mode: return parsed JSON
                const jsonMatch = llmResponse.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[1]);
                }
                // Try to parse directly if no code block
                return JSON.parse(llmResponse);
            }
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', parseError);
            console.log('Raw response:', llmResponse);
            throw new Error('Failed to parse AI suggestion response');
        }

    } catch (error) {
        console.error('API call error:', error);
        throw new Error('API call failed.');
    }
}

function parseChatResponse(response: string): { message: string; updatedData: any | null } {
    let updatedData: any | null = null;
    let cleanMessage = response;

    try {
        // Look for DATA_UPDATE marker and JSON block
        const dataUpdateMatch = response.match(/DATA_UPDATE:\s*```json\s*([\s\S]*?)\s*```/);
        if (dataUpdateMatch) {
            updatedData = JSON.parse(dataUpdateMatch[1]);
            // Remove the DATA_UPDATE section from the message
            cleanMessage = response.replace(/DATA_UPDATE:\s*```json[\s\S]*?```/g, '').trim();
        } else {
            // Fallback: try to find any JSON block in the response
            const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                updatedData = JSON.parse(jsonMatch[1]);
                // Remove the JSON block from the message
                cleanMessage = response.replace(/```json[\s\S]*?```/g, '').trim();
            }
        }
    } catch (error) {
        console.error('Failed to extract structured data from chat:', error);
        // If parsing fails, just return the original message with no data update
        updatedData = null;
    }

    // Clean up excessive blank lines - replace multiple consecutive newlines with max 2 (one blank line)
    cleanMessage = cleanMessage.replace(/\n{3,}/g, '\n\n').trim();

    return {
        message: cleanMessage,
        updatedData: updatedData
    };
}

async function generatePromptFromData(
    documentData: DocumentData,
    locale: string,
    source: string = 'finalropa',
    chatMode: string,
    messages?: ChatMessage[],
    isInitial?: boolean
): Promise<string> {

    const promptTemplate = await import(`../../data/prompt.json`).then(mod => mod.default);

    let basePrompt: string;

    // Determine if this is a chat request or AI suggestion
    const isChat = messages !== undefined; // Can be empty array for initial message

    if (chatMode === "chat" && isChat) {
        // Chat mode: use chat prompts
        basePrompt = promptTemplate.chat.base || '';
        const sectionPromptKey = source.charAt(0).toUpperCase() + source.slice(1);
        const sectionPrompt = (promptTemplate.chat as any)[sectionPromptKey] || (promptTemplate.chat as any)[source] || '';
        basePrompt = `${basePrompt}\n\n${sectionPrompt}`;

        // Add initial message instructions
        if (isInitial) {
            basePrompt += '\n\nThis is the FIRST message in the conversation. Greet the user, briefly explain the purpose of this section without mentioning any examples. Analyze the current document context. At the end, ask them if they need any help or have questions about filling out this section.';
        }
    } else if (chatMode == "ask" && isChat) {
        // Explain mode: use explain prompts
        basePrompt = promptTemplate.ask.base || '';
        const sectionPromptKey = source.charAt(0).toUpperCase() + source.slice(1);
        const sectionPrompt = (promptTemplate.ask as any)[sectionPromptKey] || (promptTemplate.ask as any)[source] || '';
        basePrompt = `${basePrompt}\n\n${sectionPrompt}`;

        // Add initial message instructions
        if (isInitial) {
            basePrompt += '\n\nThis is the FIRST message in the conversation. Greet the user, briefly explain the purpose of this section without mentioning any examples. Analyze the current document context. At the end, ask them if they need any help or have questions about filling out this section.';
                    }
    } else {
        // AI suggestion mode: use regular prompts
        switch (source) {
            case 'purposeOfDataProcessing':
            case 'technicalOrganizationalMeasures':
            case 'legalBasis':
            case 'dataSources':
            case 'dataCategories':
            case 'personCategories':
            case 'retentionPeriods':
            case 'additionalInfo':
                basePrompt = promptTemplate.form[source];
                break;
            case 'finalropa':
            default:
                basePrompt = promptTemplate.finalropa;
                break;
        }
    }

    // Build context data
    const contextData = isChat ? `

Language: ${locale}

Current Document Context:
- Title: ${documentData.title || 'Not specified'}
- Organization: ${documentData.organization.name || 'Not specified'}
- Organization Role: ${documentData.organization.role || 'Not specified'}
- Organization Address: ${documentData.organization.contact.address || 'Not specified'}
- Organization Email: ${documentData.organization.contact.email || 'Not specified'}
- Organization Phone: ${documentData.organization.contact.phone || 'Not specified'}
- Representative: ${documentData.organization.representative || 'Not specified'}
- Data Protection Officer: ${documentData.organization.dpo || 'Not specified'}

Purpose of Data Processing:
${documentData.purposeOfDataProcessing || 'Not specified'}

Technical and Organizational Measures:
${documentData.technicalOrganizationalMeasures || 'Not specified'}

Legal Basis:
${JSON.stringify(documentData.legalBasis, null, 2)}

Data Sources:
${JSON.stringify(documentData.categories.dataSources, null, 2)}

Data Categories:
${JSON.stringify(documentData.categories.dataCategories, null, 2)}

Person Categories:
${JSON.stringify(documentData.categories.persons, null, 2)}

Retention Periods:
${JSON.stringify(documentData.retentionPeriods, null, 2)}

Additional Information:
${documentData.additionalInfo || 'Not specified'}

Use all this context to provide relevant and specific suggestions for the ${source} section.
    `.trim() : `
    

    Language: IMPORTANT: You must use ${locale}.
    
    Document Title:
    ${documentData.title || 'No title provided.'}
    
    Organization Information:
    - Name: ${documentData.organization.name || 'Not specified'}
    - Role: ${documentData.organization.role || 'Not specified'}
    - Address: ${documentData.organization.contact.address || 'Not specified'}
    - Email: ${documentData.organization.contact.email || 'Not specified'}
    - Phone: ${documentData.organization.contact.phone || 'Not specified'}
    - Representative: ${documentData.organization.representative || 'Not specified'}
    - Data Protection Officer: ${documentData.organization.dpo || 'Not specified'}
    
    Purpose of Data Processing:
    ${documentData.purposeOfDataProcessing || 'No purpose specified.'}
    
    Technical and Organizational Measures:
    ${documentData.technicalOrganizationalMeasures || 'No measures specified.'}
    
    Legal Basis for Processing:
    ${JSON.stringify(documentData.legalBasis, null, 2)}
    
    Data Sources:
    ${JSON.stringify(documentData.categories.dataSources, null, 2)}
    
    Data Categories:
    ${JSON.stringify(documentData.categories.dataCategories, null, 2)}
    
    Person Categories:
    ${JSON.stringify(documentData.categories.persons, null, 2)}
    
    Retention Periods:
    ${JSON.stringify(documentData.retentionPeriods, null, 2)}
    
    Additional Information:
    ${documentData.additionalInfo || 'No additional information provided.'}
    
        `.trim();

    const prompt = basePrompt + contextData;

    console.log(prompt)
    return prompt;
}
