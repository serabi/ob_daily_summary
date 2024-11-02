interface PluginSettings {
    apiKey: string;
    apiEndpoint: string;
    reportLocation: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
    apiKey: '',
    apiEndpoint: '',
    reportLocation: '/'
};

export { type PluginSettings, DEFAULT_SETTINGS };