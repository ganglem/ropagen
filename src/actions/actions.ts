"use server";

import {DocumentData, Template} from "@/models/DocumentData";
import { generateText } from "ai";
import {openai} from '@ai-sdk/openai';
import {Mistral} from "@mistralai/mistralai";
import {availableModels} from "@/config/models";

export async function fetchMockTemplates(locale: string = "en"): Promise<Template[]> {
    // Dynamically import the correct mock-<locale>.json file
    const templates = await import(`../../data/mock-${locale}.json`).then(mod => mod.default);
    return templates as unknown as Template[];
}

export async function callLLMapi(data: DocumentData, locale: string, selectedModel: string = 'gpt-4o'): Promise<string> {
    try {
        const prompt = await generatePromptFromData(data, locale);

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

            // Fix: Correctly access the Mistral response content with safety checks
            const content = response.choices[0]?.message?.content;
            llmResponse = typeof content === 'string' ? content : String(content || '');

            console.log(response)

        } else if (modelEndpoint == "openai") {
            const response = await generateText({
                model: openai(selectedModel),
                prompt: prompt,
                temperature: 0,
            });
            llmResponse = response.text || '';

            console.log(response)
        }

        // Ensure we always return a string
        return typeof llmResponse === 'string' ? llmResponse : String(llmResponse);

    } catch (error) {
        console.error('API call error:', error);
        throw new Error('API call failed.');
    }
}

export async function callLLMapiForSuggestion(data: DocumentData, locale: string, source: string, selectedModel: string = 'gpt-4o'): Promise<any> {
    try {
        const prompt = await generatePromptFromData(data, locale, source);

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

            const content = response.choices[0]?.message?.content;
            llmResponse = typeof content === 'string' ? content : String(content || '');

            console.log(response)

        } else if (modelEndpoint == "openai") {
            const response = await generateText({
                model: openai(selectedModel),
                prompt: prompt,
                temperature: 0.3,
            });
            llmResponse = response.text || '';

            console.log(response)
        }

        // Parse the JSON response
        try {
            const jsonMatch = llmResponse.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            // Try to parse directly if no code block
            return JSON.parse(llmResponse);
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

async function generatePromptFromData(documentData: DocumentData, locale: string, source: string = 'finalropa'): Promise<string> {

    // Process data sources
    const selectedDataSources = Object.entries(documentData.categories.dataSources)
        .filter(([key, value]) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value.trim() !== '';
            return false;
        })
        .map(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
                return `- ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`;
            }
            return `- ${key.replace(/([A-Z])/g, ' $1').trim()}`;
        })
        .join('\n');

    // Process data categories
    const selectedDataCategories = Object.entries(documentData.categories.dataCategories)
        .map(([categoryKey, categoryData]) => {
            const selectedSubCategories = Object.entries(categoryData)
                .filter(([subKey, value]) => {
                    if (typeof value === 'boolean') return value;
                    if (typeof value === 'string') return value.trim() !== '';
                    return false;
                })
                .map(([subKey, value]) => {
                    if (typeof value === 'string' && value.trim() !== '') {
                        return `  - ${subKey.replace(/([A-Z])/g, ' $1').trim()}: ${value}`;
                    }
                    return `  - ${subKey.replace(/([A-Z])/g, ' $1').trim()}`;
                })
                .join('\n');

            if (selectedSubCategories) {
                return `${categoryKey.replace(/([A-Z])/g, ' $1').trim()}:\n${selectedSubCategories}`;
            }
            return null;
        })
        .filter(Boolean)
        .join('\n\n');

    // Process person categories
    const selectedPersonCategories = Object.entries(documentData.categories.persons)
        .map(([categoryKey, categoryData]) => {
            if (categoryKey === 'other') {
                // Handle the 'other' field which is a string
                if (typeof categoryData === 'string' && categoryData.trim() !== '') {
                    return `Other Person Categories: ${categoryData}`;
                }
                return null;
            }

            const selectedSubCategories = Object.entries(categoryData)
                .filter(([_, isSelected]) => isSelected)
                .map(([subKey]) => `  - ${subKey.replace(/([A-Z])/g, ' $1').trim()}`)
                .join('\n');

            if (selectedSubCategories) {
                return `${categoryKey.replace(/([A-Z])/g, ' $1').trim()}:\n${selectedSubCategories}`;
            }
            return null;
        })
        .filter(Boolean)
        .join('\n\n');

    // Process legal basis
    const selectedLegalBasis = Object.entries(documentData.legalBasis)
        .filter(([key, value]) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value.trim() !== '';
            return false;
        })
        .map(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
                return `- ${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`;
            }
            return `- ${key.replace(/([A-Z])/g, ' $1').trim()}`;
        })
        .join('\n');

    // Process retention periods
    const retentionInfo = Object.entries(documentData.retentionPeriods)
        .filter(([key, value]) => {
            if (key === 'deletionTime') return value && value.trim() !== '';
            return value === true;
        })
        .map(([key, value]) => {
            if (key === 'deletionTime') return `- Deletion Time: ${value}`;
            return `- ${key.replace(/([A-Z])/g, ' $1').trim()}`;
        })
        .join('\n');

    const promptTemplate = await import(`../../data/prompt.json`).then(mod => mod.default);

    let basePrompt: string;
    switch (source) {
        case 'purposeOfDataProcessing':
        case 'technicalOrganizationalMeasures':
        case 'legalBasis':
        case 'dataSources':
        case 'dataCategories':
        case 'personCategories':
        case 'retentionPeriods':
        case 'additionalInfo':
            basePrompt = promptTemplate[source];
            break;
        case 'finalropa':
        default:
            basePrompt = promptTemplate.finalropa;
            break;
    }

    // For suggestion prompts, add context data
    const contextData = `

    Language: ${locale}
    
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
    ${selectedLegalBasis || 'No legal basis specified.'}
    
    Data Sources:
    ${selectedDataSources || 'No data sources specified.'}
    
    Data Categories:
    ${selectedDataCategories || 'No data categories specified.'}
    
    Person Categories:
    ${selectedPersonCategories || 'No person categories specified.'}
    
    Retention Periods:
    ${retentionInfo || 'No retention periods specified.'}
    
    Additional Information:
    ${documentData.additionalInfo || 'No additional information provided.'}
    
        `.trim();

    const prompt = basePrompt + contextData;

    console.log(prompt)
    return prompt;
}
