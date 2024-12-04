interface PluginSettings {
    apiKey: string;
    apiEndpoint: string;
    ollamaModel: string;
    openaiModel: string;
    reportLocation: string;
    excludedFolders: string[];
    promptTemplate: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
    apiKey: '',
    apiEndpoint: '',
    ollamaModel: '',
    openaiModel: 'gpt-4o-mini',
    reportLocation: '/',
    excludedFolders: [],
    promptTemplate: 'Please summarize the main content of today\'s notes:\n\n{{notes}}'
};

export { type PluginSettings, DEFAULT_SETTINGS };