// Available LLM models configuration
export interface ModelOption {
    name: string;
    label: string;
}

export const availableModels: ModelOption[] = [
    {
        name: "openai/gpt-4.1",
        label: "GPT-4.1",
    },
    {
        name: "openai/chatgpt-4o-latest",
        label: "GPT-4o",
    },
    {
        name: "mistralai/mistral-small-3.2-24b-instruct",
        label: "Magistral Small 3.2 24B",
    }
];

// Default model
export const defaultModel = "openai/chatgpt-4o-latest";
