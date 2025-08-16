// Available LLM models configuration
export interface ModelOption {
    value: string;
    label: string;
}

export const availableModels: ModelOption[] = [

    {
        value: "gpt-4.1",
        label: "GPT-4.1",
    },
    {
        value: "gpt-4o",
        label: "GPT-4o",
    }
];

// Default model
export const defaultModel = "gpt-4o";
