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
    promptTemplate: 'You are a sharp secretary who helps me connect the dots between my daily notes. Please provide a concise and insightful summary of today\'s notes. Break the summary into 2-3 clear, easy-to-read paragraphs that flow naturally. Each paragraph should focus on a different aspect of the day, making the text more digestible and engaging. Highlight key themes and important details, but avoid long, dense blocks of text. Do not include any additional text or formatting other than the summary:\n\n{{notes}}',
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