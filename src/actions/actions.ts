"use server";

import {Category, DocumentData, Template} from "@/models/DocumentData";
import { generateText } from "ai";
import {openai} from '@ai-sdk/openai';
import templates from "../../data/mock.json";
import {Mistral} from "@mistralai/mistralai";
import {availableModels} from "@/config/models";

export async function fetchMockTemplates(): Promise<Template[]> {
    return templates as unknown as Template[];
}

export async function generateDocument(data: DocumentData, locale: string, selectedModel: string = 'gpt-4o'): Promise<string> {
    try {
        const prompt = generatePromptFromData(data, locale);
        
        //TODO this is hardcoded, make it more flexible in the future

        let llmResponse = "";

        const modelEndpoint = availableModels.find(model => model.name == selectedModel)?.endpoint

        if (modelEndpoint == "mistral") {
            const mistralApiKey = process.env.MISTRAL_API_KEY;

            const client = new Mistral({apiKey: mistralApiKey});

            const response = await client.chat.complete({
                model: selectedModel,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            })

            // @ts-ignore
            llmResponse = response.choices[0].message.content[1].text as string;

            console.log(response)

        } else if (modelEndpoint == "openai") {
            const response = await generateText({
                model: openai(selectedModel),
                prompt: prompt,
                temperature: 0,
            });
            llmResponse = response.text;

            console.log(response)
        }

        return llmResponse;

    } catch (error) {
        console.error('Error generating document:', error);
        throw new Error('Failed to generate document');
    }
}

function generatePromptFromData(documentData: DocumentData, locale: string): string {

    const selectedCategories = Object.entries(documentData.categories)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => `- ${Category[key as keyof typeof Category]}`)
        .join('\n');

    const prompt = `
    You are an expert in data protection compliance. Generate a professional, structured Records of Processing Activities (ROPA) document in full compliance with the EU General Data Protection Regulation (GDPR).
    
    This ROPA document must be suitable for official regulatory review and written in formal business language.
    
    Language: ${locale}
    
    Document Title:
    ${documentData.title || 'No title provided. Use standard GDPR best practices.'}
    
    Included GDPR Compliance Categories:
    ${selectedCategories || 'None specified. Apply general GDPR processing practices.'}
    
    Additional Information and Special Instructions:
    ${documentData.additionalInfo || 'No additional instructions provided. Use standard GDPR best practices.'}
    
    Instructions:
    - Begin with an executive summary.
    - Clearly structure the document with headings for each included category.
    - For each category, describe processing purposes, legal basis, data subjects involved, data processors/controllers, retention periods, and safeguards.
    - Maintain a professional, legally appropriate tone throughout.
    
    The output should be suitable for use by a Data Protection Officer (DPO) or legal counsel.
    The output should be in .md style.
        `.trim();

    return prompt;
}
