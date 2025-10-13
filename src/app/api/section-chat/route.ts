import { NextRequest, NextResponse } from "next/server";
import { DocumentData } from "@/models/DocumentData";
import { generateText } from "ai";
import { openai } from '@ai-sdk/openai';
import { Mistral } from "@mistralai/mistralai";
import { availableModels } from "@/config/models";

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
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { source, documentData, messages, locale, selectedModel } = body;

        // Build the system prompt based on the section
        const systemPrompt = buildSystemPrompt(source, documentData, locale);

        // Build conversation history
        const conversationHistory = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Get the model endpoint
        const modelEndpoint = availableModels.find(model => model.name === selectedModel)?.endpoint;

        let assistantResponse = "";

        if (modelEndpoint === "mistral") {
            const mistralApiKey = process.env.MISTRAL_API_KEY;
            const client = new Mistral({ apiKey: mistralApiKey });

            const response = await client.chat.complete({
                model: selectedModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...conversationHistory as any
                ],
            });

            const content = response.choices[0]?.message?.content;
            assistantResponse = typeof content === 'string' ? content : String(content || '');
        } else if (modelEndpoint === "openai") {
            const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nassistant:`;

            const response = await generateText({
                model: openai(selectedModel),
                prompt: fullPrompt,
                temperature: 0.7,
            });

            assistantResponse = response.text || '';
        }

        // Try to extract structured data from the response
        const updatedData = extractStructuredData(assistantResponse, source);

        return NextResponse.json({
            message: cleanMessageForDisplay(assistantResponse),
            updatedData: updatedData
        });

    } catch (error) {
        console.error('Section chat error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}

function buildSystemPrompt(source: string, documentData: DocumentData, locale: string): string {
    const contextData = `
Current Document Context:
- Title: ${documentData.title || 'Not specified'}
- Organization: ${documentData.organization.name || 'Not specified'}
- Purpose: ${documentData.purposeOfDataProcessing || 'Not specified'}
`;

    const baseInstructions = `You are an expert GDPR compliance assistant helping users fill out their Records of Processing Activities (ROPA) documentation. The language for responses is: ${locale}.

Your role is to:
1. Answer questions about the current section in a helpful, conversational way
2. Guide users through what information they need to provide
3. Based on user responses, fill out the data structure appropriately
4. When you have enough information to update the data structure, include it in your response

${contextData}`;

    const sectionSpecificInstructions = getSectionInstructions(source);

    return `${baseInstructions}\n\n${sectionSpecificInstructions}`;
}

function getSectionInstructions(source: string): string {
    const instructions: Record<string, string> = {
        purposeOfDataProcessing: `
You are helping with the "Purpose of Data Processing" section.

When you have enough information from the conversation, respond with BOTH:
1. A conversational message to the user
2. A JSON block with the structured data

Format your response like this:
[Your conversational response to the user]

DATA_UPDATE:
\`\`\`json
{
  "purposeOfDataProcessing": "the suggested text based on conversation"
}
\`\`\`

The text should be professional, clear, and suitable for GDPR documentation (max 1000 characters).`,

        technicalOrganizationalMeasures: `
You are helping with the "Technical and Organizational Measures" section.

When you have enough information from the conversation, respond with BOTH:
1. A conversational message to the user
2. A JSON block with the structured data

Format your response like this:
[Your conversational response to the user]

DATA_UPDATE:
\`\`\`json
{
  "technicalOrganizationalMeasures": "the suggested security measures based on conversation"
}
\`\`\`

The text should list specific, actionable security measures (max 1000 characters).`,

        legalBasis: `
You are helping with the "Legal Basis" section.

Available legal basis options are:
- DSGVOArt6Abs1a (Consent)
- DSGVOArt6Abs1b (Contract)
- DSGVOArt6Abs1c (Legal obligation)
- DSGVOArt6Abs1f (Legitimate interests)
- IfSG28b, SARSCoV, BDSG26, HGB257, HGB239Abs1, AO147 (Various specific laws)
- other (text field for additional information)

When you have enough information, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "legalBasis": {
    "DSGVOArt6Abs1a": false,
    "DSGVOArt6Abs1b": true,
    "DSGVOArt6Abs1c": false,
    "DSGVOArt6Abs1f": false,
    "IfSG28b": false,
    "SARSCoV": false,
    "BDSG26": false,
    "HGB257": false,
    "HGB239Abs1": false,
    "AO147": false,
    "other": ""
  }
}
\`\`\``,

        dataSources: `
You are helping with the "Data Sources" section.

Available data source options include:
- microsoftOffice365, emailProvider, microsoftAzure, googleWorkspace, googleCloud
- videoConferencing, amazonAWS, ecommercePlatform, libreOffice, onlineBanking
- financialServices, webAndIntranet, creditServices, hrSoftware, enterpriseSystems
- securityAndCompliance, documentProcessing, otherSpecializedSoftware
- other (text field)

When you understand which sources they use, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "dataSources": {
    "microsoftOffice365": true,
    "emailProvider": true,
    ...other fields...
    "other": ""
  }
}
\`\`\``,

        dataCategories: `
You are helping with the "Data Categories" section.

This includes nested categories like:
- personalData (lastName, firstName, dateOfBirth, etc.)
- employment (workingHours, professionalPosition, etc.)
- finance (salaryWage, bankDetails, etc.)
- health (healthInsuranceNumber, sickDays, etc.)
- legal, behavior, documentationAndRecords, vehicle, other

When you understand which categories apply, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "dataCategories": {
    "personalData": {
      "lastName": true,
      "firstName": true,
      "emailAddress": true,
      ...other fields...
    },
    "employment": { ...fields... },
    ...other categories...
  }
}
\`\`\``,

        personCategories: `
You are helping with the "Person Categories" section.

This includes:
- affectedPersons (internalGroups, externalCustomers, etc.)
- internalRecipientCategories (management, administration, etc.)
- externalRecipientCategoriesEU (governmentAuthorities, serviceProviders, etc.)
- authorizedPersons (managementRoles, administrativeRoles, etc.)
- other (text field)

When you understand which categories apply, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "persons": {
    "affectedPersons": { ...fields... },
    "internalRecipientCategories": { ...fields... },
    "externalRecipientCategoriesEU": { ...fields... },
    "authorizedPersons": { ...fields... },
    "other": ""
  }
}
\`\`\``,

        retentionPeriods: `
You are helping with the "Retention Periods" section.

Fields include:
- afterTerminationOfEmployment (boolean)
- afterContractTermination (boolean)
- uponRevocation (boolean)
- deletionTime (string describing timeframe)
- exceptForBeyondRetentionObligations (boolean)
- specialDeletionConcept (boolean)

When you have enough information, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "retentionPeriods": {
    "afterTerminationOfEmployment": false,
    "afterContractTermination": true,
    "uponRevocation": false,
    "deletionTime": "3 years after contract ends",
    "exceptForBeyondRetentionObligations": true,
    "specialDeletionConcept": false
  }
}
\`\`\``,

        additionalInfo: `
You are helping with the "Additional Information" section.

This is for any supplementary information relevant to the ROPA documentation.

When you have enough information, respond with:
[Your conversational response]

DATA_UPDATE:
\`\`\`json
{
  "additionalInfo": "additional text based on conversation (max 1000 characters)"
}
\`\`\``,
    };

    return instructions[source] || "Help the user with this section.";
}

function extractStructuredData(response: string, source: string): any | null {
    try {
        // Look for DATA_UPDATE marker and JSON block
        const dataUpdateMatch = response.match(/DATA_UPDATE:\s*```json\s*([\s\S]*?)\s*```/);
        if (dataUpdateMatch) {
            return JSON.parse(dataUpdateMatch[1]);
        }

        // Also try to find any JSON block in the response
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }

        return null;
    } catch (error) {
        console.error('Failed to extract structured data:', error);
        return null;
    }
}

function cleanMessageForDisplay(response: string): string {
    // Remove the DATA_UPDATE section from the message shown to user
    return response.replace(/DATA_UPDATE:\s*```json[\s\S]*?```/g, '').trim();
}
