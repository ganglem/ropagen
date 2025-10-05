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
        console.error('API call error:', error);
        throw new Error('API call failed.');
    }
}

function generatePromptFromData(documentData: DocumentData, locale: string): string {

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

    const prompt = `
    You are an expert in data protection compliance. Generate a professional, structured Records of Processing Activities (ROPA) document in full compliance with the EU General Data Protection Regulation (GDPR).
    
    This ROPA document must be suitable for official regulatory review and written in formal business language.
    
    Language: ${locale}
    
    Document Title:
    ${documentData.title || 'No title provided. Use standard GDPR best practices.'}
    
    Organization Information:
    - Name: ${documentData.organization.name || 'Not specified'}
    - Role: ${documentData.organization.role || 'Not specified'}
    - Address: ${documentData.organization.contact.address || 'Not specified'}
    - Email: ${documentData.organization.contact.email || 'Not specified'}
    - Phone: ${documentData.organization.contact.phone || 'Not specified'}
    - Representative: ${documentData.organization.representative || 'Not specified'}
    - Data Protection Officer: ${documentData.organization.dpo || 'Not specified'}
    
    Purpose of Data Processing:
    ${documentData.purposeOfDataProcessing || 'No purpose specified. Use standard GDPR processing practices.'}
    
    Technical and Organizational Measures:
    ${documentData.technicalOrganizationalMeasures || 'No measures specified. Use standard GDPR security measures.'}
    
    Legal Basis for Processing:
    ${selectedLegalBasis || 'No legal basis specified. Apply general GDPR legal basis requirements.'}
    
    Data Sources:
    ${selectedDataSources || 'No data sources specified.'}
    
    Data Categories:
    ${selectedDataCategories || 'No data categories specified.'}
    
    Person Categories:
    ${selectedPersonCategories || 'No person categories specified.'}
    
    Retention Periods:
    ${retentionInfo || 'No retention periods specified. Use standard GDPR retention practices.'}
    
    Additional Information and Special Instructions:
    ${documentData.additionalInfo || 'No additional instructions provided. Use standard GDPR best practices.'}
    
    Instructions:
    - Create a comprehensive ROPA document structure with the following sections:
      1. Organization and Controller Information
      2. Purpose and Legal Basis for Processing
      3. Data Categories and Sources
      4. Data Subjects and Recipients
      5. Data Retention and Deletion
      6. Technical and Organizational Measures
    - Each category can have a continous text and bullet points as needed.
    - Ensure compliance with GDPR Articles 30 (Records of processing activities) requirements.
    - Respect the Additional Information and Special Instructions provided.
    - You must include all data given, and must not omit any data provided.
    
    The output should be suitable for use by a Data Protection Officer (DPO) or legal counsel.
    The output should be in .md style with proper headings and formatting.
        `.trim();

    console.log(prompt)
    return prompt;
}
