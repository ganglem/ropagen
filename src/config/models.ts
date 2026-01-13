// Available LLM models configuration
export interface ModelOption {
    name: string;
    label: string;
}

export const availableModels: ModelOption[] = [
    {
        name: "mistralai/mistral-small-3.2-24b-instruct",
        label: "Magistral Small 3.2 24B",
    }
];

// Default model
export const defaultModel = "mistralai/mistral-small-3.2-24b-instruct";
