interface PluginSettings {
    apiKey: string;
    apiEndpoint: string;
    ollamaModel: string;
    openaiModel: string;
    reportLocation: string;
    excludedFolders: string[];
}

const DEFAULT_SETTINGS: PluginSettings = {
    apiKey: '',
    apiEndpoint: '',
    ollamaModel: '',
    openaiModel: 'gpt-4o-mini',
    reportLocation: '/',
    excludedFolders: []
};

export { type PluginSettings, DEFAULT_SETTINGS };