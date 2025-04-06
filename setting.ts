interface PluginSettings {
    apiKey: string;
    apiEndpoint: string;
    ollamaModel: string;
    openaiModel: string;
    reportLocation: string;
    excludedFolders: string[];
    promptTemplate: string;
    dateFormat: {
        input: string;     // Format used when inputting dates
        display: string;   // Format used when displaying dates
        parse: (dateString: string) => Date; // Custom parse function
    };
}

const DEFAULT_SETTINGS: PluginSettings = {
    apiKey: '',
    apiEndpoint: '',
    ollamaModel: '',
    openaiModel: 'gpt-4o-mini',
    reportLocation: '/',
    excludedFolders: [],
    promptTemplate: 'Please summarize the main content of today\'s notes:\n\n{{notes}}',
    dateFormat: {
        input: 'YYYY-MM-DD',
        display: 'YYYY-MM-DD',
        parse: (dateString: string) => {
            // Default to using native Date parsing
            const parsedDate = new Date(dateString);
            
            // Ensure the date is valid and set to midnight
            if (!isNaN(parsedDate.getTime())) {
                return new Date(
                    parsedDate.getFullYear(), 
                    parsedDate.getMonth(), 
                    parsedDate.getDate()
                );
            }
            
            // Fallback to current date if parsing fails
            return new Date();
        }
    }
};

export { type PluginSettings, DEFAULT_SETTINGS };