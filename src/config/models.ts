// Available LLM models configuration
export interface ModelOption {
    name: string;
    label: string;
}

export const availableModels: ModelOption[] = [
    {
        name: "mistralai/mistral-large-2512",
        label: " Mistral Large 3 2512",
    }
];

// Default model
export const defaultModel = "mistralai/mistral-large-2512";
