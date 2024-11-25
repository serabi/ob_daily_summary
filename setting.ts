interface PluginSettings {
    apiKey: string;
    apiEndpoint: string;
    ollamaModel: string;
    reportLocation: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
    apiKey: '',
    apiEndpoint: '',
    ollamaModel: '',
    reportLocation: '/'
};

export { type PluginSettings, DEFAULT_SETTINGS };