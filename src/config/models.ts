// Available LLM models configuration
export interface ModelOption {
    name: string;
    label: string;
    endpoint: string;
}

export const availableModels: ModelOption[] = [
    {
        name: "gpt-4.1",
        label: "GPT-4.1",
        endpoint: "openai"

    },
    {
        name: "gpt-4o",
        label: "GPT-4o",
        endpoint: "openai"
    },
    {
        name: "magistral-small-latest",
        label: "Magistral Small",
        endpoint: "mistral"
    }
];

// Default model
export const defaultModel = "gpt-4o";
