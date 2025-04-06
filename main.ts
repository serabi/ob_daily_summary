import {
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    Notice,
    Modal,
    normalizePath,
    requestUrl
} from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './setting';

export default class DailyDigestPlugin extends Plugin {
    settings: PluginSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new DailyDigestSettingTab(this.app, this));

        this.addCommand({
            id: 'generate-daily-report',
            name: 'Generate daily report',
            callback: () => this.generateDailyReport(0)
        });

        this.addCommand({
            id: 'generate-previous-day-report',
            name: 'Generate previous day report',
            callback: () => {
                const modal = new DaysSelectionModal(this.app, async (days: number) => {
                    if (days > 0) days = -days;
                    await this.generateDailyReport(days);
                });
                modal.open();
            }
        });

        // Add new command for specific date selection
        this.addCommand({
            id: 'generate-report-for-date',
            name: 'Generate report for specific date',
            callback: () => {
                const modal = new DatePickerModal(this.app, async (selectedDate: Date) => {
                    await this.generateDailyReportForDate(selectedDate);
                });
                modal.open();
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        
        // Ensure promptTemplate is always set
        if (!this.settings.promptTemplate) {
            this.settings.promptTemplate = DEFAULT_SETTINGS.promptTemplate;
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async generateDailyReport(daysOffset: number = 0) {
        try {
            let targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysOffset);
            // Normalize the date to midnight
            targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            
            await this.generateDailyReportForDate(targetDate);
            
        } catch (error) {
            await this.logError(error, 'Fail to generate report');
            console.error('Error generating daily report:', error);
            new Notice(`Error: ${error.message}`);
        }
    }

    async callLLM(prompt: string) {
        try {
            if (this.settings.ollamaModel != "") { // If ollamaModel set, run Ollama query
                let endpoint = this.settings.apiEndpoint;
                if (endpoint === "") {
                    endpoint = "http://localhost:11434"
                }
                const response = await requestUrl({
                    method: "POST",
                    url: `${endpoint}/api/generate`,
                    body: JSON.stringify({
                        prompt: prompt,
                        model: this.settings.ollamaModel,
                        options: {
                            temperature: 0.7,
                        }
                    })
                }).then((response) => {
                    if (response.status !== 200) {
                        throw new Error(`Ollama request failed: ${response.status}`);
                    }
                    const steps:string = response.text
                        .split("\n")
                        .filter((step) => step && step.length > 0)
                        .map((step) => JSON.parse(step))
                        .map((step) => step.response)
                        .join("")
                        .trim();
                    return steps;
                });

                return response;
            } else { // Run ChatGPT query
                    const response = await requestUrl({
                        url: this.settings.apiEndpoint,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.settings.apiKey}`
                        },
                        body: JSON.stringify({
                            model: this.settings.openaiModel,
                            messages: [
                                {
                                    role: 'user',
                                    content: prompt
                                }
                            ],
                            temperature: 0.7
                        })
                    });
        
        
                    if (response.status !== 200) {
                        throw new Error(`API request failed: ${response.status}`);
                    }
        
                    return response.json.choices?.[0]?.message?.content || '';
            }
        } catch (error) {
            await this.logError(error, 'Fail to call LLM API');
            throw new Error(`Fail to call LLM API: ${error.message}`);
        }
    }

    async createDailyReport(date: Date, content: string) {
        try {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            const fileName = normalizePath(`${this.settings.reportLocation}/Daily Report-${dateString}.md`);

            if (await this.app.vault.adapter.exists(fileName)) {
                const existingContent = await this.app.vault.adapter.read(fileName);
                const newContent = `${existingContent}\n\n## updated at ${new Date().toLocaleTimeString()}\n\n${content}`;
                await this.app.vault.adapter.write(fileName, newContent);
            } else {
                const fileContent = `# ${dateString} report\n\n${content}`;
                await this.app.vault.create(fileName, fileContent);
            }

        } catch (error) {
            console.error('Fail to create/update report file:', error);
            throw new Error(`Fail to create/update file: ${error.message}`);
        }
    }

    async generateDailyReportForDate(date: Date) {
        try {
            const files = this.app.vault.getMarkdownFiles();
            const todayNotes = files.filter(file => {
                const fileDate = new Date(file.stat.ctime);
                const fileCreateDate = new Date(fileDate.getFullYear(), fileDate.getMonth(), fileDate.getDate()).getTime();
                const modifyDate = new Date(file.stat.mtime);
                const fileModifyDate = new Date(modifyDate.getFullYear(), modifyDate.getMonth(), modifyDate.getDate()).getTime();
                
                const isExcluded = this.settings.excludedFolders.some(folder => {
                    if (!folder) return false;
                    const normalizedFolder = normalizePath(folder);
                    const normalizedFilePath = normalizePath(file.path);
                    return normalizedFilePath.startsWith(normalizedFolder + '/') || 
                           normalizedFilePath === normalizedFolder;
                });
                
                return !isExcluded && (fileCreateDate === date.getTime() || 
                       fileModifyDate === date.getTime());
            });
            new Notice(`Found ${todayNotes.length} notes`);

            if (todayNotes.length === 0) {
                new Notice(`No notes found for ${date.toISOString().split('T')[0]}`);
                return;
            }

            const prompt:string = await this.generatePrompt(todayNotes, date);

            const summary:string = await this.callLLM(prompt);

            if (!summary) {
                new Notice('Failed to generate summary');
                return;
            }

            await this.createDailyReport(date, summary);
            new Notice('Daily report generated successfully!');

        } catch (error) {
            await this.logError(error, 'Fail to generate report');
            console.error('Error generating daily report:', error);
            new Notice(`Error: ${error.message}`);
        }
    }

    private getDateFromFileName(fileName: string): Date {
        const match = fileName.match(/(\d{4}-\d{2}-\d{2})/);
        if (match == null) {
            throw "FileName is not a date";
        }
        return new Date(match[1])
    }

    private async generatePrompt(notes: any[], date?: Date): Promise<string> {
        try {
            const notesContents = await Promise.all(
                notes.map(async note => {
                    const content = await this.app.vault.read(note);
                    return `${note.name}:\n${content}`;
                })
            );

            const allContent = notesContents.join('\n\n');
            
            let prompt = this.settings.promptTemplate.replace('{{notes}}', allContent);
            
            // Add date information to the prompt if available
            if (date) {
                // Format the date using the display format
                const dateString = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                });
                
                // Replace "today's notes" with "notes from [date]" if the prompt contains that text
                if (prompt.includes("today's notes")) {
                    prompt = prompt.replace("today's notes", `notes from ${dateString}`);
                }
            }
            
            return prompt;
        } catch (error) {
            console.error('Fail to generate prompt:', error);
            throw new Error(`Fail to generate prompt: ${error.message}`);
        }
    }

    private async logError(error: any, context: string) {
        try {
            const time = new Date().toISOString();
            const errorLog = `
[${time}] ${context}
Error message: ${error.message}
Stack trace: ${error.stack}
API configuration: 
- endpoint: ${this.settings.apiEndpoint || 'Not set'}
- model: ${this.settings.ollamaModel} || 'Not set'}
- apiKey: ${this.settings.apiKey ? 'Set' : 'Not set'}
-------------------
`;
            const logFile = `${this.settings.reportLocation}/debug-errors.md`;

            let content = errorLog;
            if (await this.app.vault.adapter.exists(logFile)) {
                const existingContent = await this.app.vault.adapter.read(logFile);
                content = existingContent + '\n' + errorLog;
            }

            await this.app.vault.adapter.write(logFile, content);
        } catch (logError) {
            console.error('Fail to write error log:', logError);
        }
    }
}

class DailyDigestSettingTab extends PluginSettingTab {
    plugin: DailyDigestPlugin;

    constructor(app: App, plugin: DailyDigestPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('API key')
            .setDesc('Enter your LLM API key')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API endpoint')
            .setDesc('Enter API endpoint address')
            .addText(text => text
                .setPlaceholder('https://api.example.com/v1/chat')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));
        
        new Setting(containerEl)
            .setName("Ollama model")
            .setDesc("Exact name of the ollama model to use for prompts. If empty, ChatGPT is used")
            .addText(text => text
                .setPlaceholder('llama-3.1-8B')
                .setValue(this.plugin.settings.ollamaModel)
                .onChange(async (value) => {
                    this.plugin.settings.ollamaModel = value;
                    await this.plugin.saveSettings();
                })
            )

        new Setting(containerEl)
            .setName('OpenAI model')
            .setDesc('Enter the name of the OpenAI model to use')
            .addText(text => text
                .setPlaceholder('gpt-4o-mini')
                .setValue(this.plugin.settings.openaiModel)
                .onChange(async (value) => {
                    this.plugin.settings.openaiModel = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Report save location')
            .setDesc('Set the folder path to save the report (e.g., /Reports or /Daily)')
            .addText(text => text
                .setPlaceholder('/')
                .setValue(this.plugin.settings.reportLocation)
                .onChange(async (value) => {
                    this.plugin.settings.reportLocation = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Excluded folders')
            .setDesc('Set the folders to exclude from the report (e.g., /Archive or /Trash)')
            .addText(text => text
                .setPlaceholder('/')
                .setValue(this.plugin.settings.excludedFolders.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.excludedFolders = value.split(',');
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName('Date format')
            .setDesc('Set the preferred date format for reports (e.g., YYYY-MM-DD)')
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.plugin.settings.dateFormat.input)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat.input = value;
                    this.plugin.settings.dateFormat.display = value;
                    await this.plugin.saveSettings();
                }));
                
        new Setting(containerEl)
            .setName('Prompt Template')
            .setDesc('Customize your prompt template. Use {{notes}} as placeholder for notes content.')
            .addTextArea(text => text
                .setPlaceholder(this.plugin.settings.promptTemplate)
                .setValue(this.plugin.settings.promptTemplate)
                .onChange(async (value) => {
                    this.plugin.settings.promptTemplate = value;
                    await this.plugin.saveSettings();
                }));
    }
}

class DaysSelectionModal extends Modal {
    private daysCallback: (days: number) => void;

    constructor(app: App, callback: (days: number) => void) {
        super(app);
        this.daysCallback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h3', { text: 'Select the number of days to generate the report' });

        const inputEl = contentEl.createEl('input', {
            type: 'number',
            value: '1',
            attr: {
                min: '1',
                max: '30'
            }
        });

        const buttonEl = contentEl.createEl('button', {
            text: 'Confirm'
        });

        buttonEl.onclick = () => {
            const days = parseInt(inputEl.value);
            if (!isNaN(days) && days > 0) {
                this.daysCallback(days);
                this.close();
            }
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

class DatePickerModal extends Modal {
    private dateCallback: (date: Date) => void;
    private datePicker: HTMLInputElement;

    constructor(app: App, callback: (date: Date) => void) {
        super(app);
        this.dateCallback = callback;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h3', { text: 'Select a date for the report' });

        // Create date picker input
        this.datePicker = contentEl.createEl('input', {
            type: 'date',
            value: new Date().toISOString().split('T')[0], // Default to today
        });

        // Add confirmation button
        const buttonEl = contentEl.createEl('button', {
            text: 'Generate Report',
            cls: 'mod-cta'
        });

        buttonEl.onclick = () => {
            const selectedDate = new Date(this.datePicker.value);
            if (!isNaN(selectedDate.getTime())) {
                this.dateCallback(selectedDate);
                this.close();
            } else {
                new Notice('Please select a valid date');
            }
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}