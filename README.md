# Daily Summary Plugin for Obsidian

An Obsidian plugin that generates daily summaries using AI. The plugin collects notes from current or previous days and then uses a LLM to generate a concise daily report.

This plugin is a fork of [Daily Summary](https://github.com/CSLukkun/ob_daily_summary). THIS PLUGIN IS IN ACTIVE DEVELOPMENT. Please note that not all features may not work at this time. 

## Current Features

- Identifies notes from the current day or a previous day. 
- Uses either Ollama or OpenAI LLM to generate intelligent summaries
- Support for a custom prompt template 
- Customizable API settings
- Configurable report save location
- Quick access through command palette

## Future Features

- Support for Anthropic API keys
- Support for multiple custom prompt templates

## Installation

### Manual Installation

1. Download the latest release from the GitHub repository
2. Create a folder named `obsidian-daily-summary` in your Obsidian vault's `.obsidian/plugins/` directory
3. Extract the downloaded plugin files into the `obsidian-daily-summary` folder
4. Ensure the following files are present:
   - `main.js`
   - `manifest.json`
   - `styles.css` (if applicable)
5. Restart Obsidian
6. Enable the plugin in Settings → Community Plugins

## Usage

1. After installation, configure the plugin settings:
   - Set your API Key
   - Configure API Endpoint
   - Set report save location

1.1. To use local Ollama models

- Set Ollama model you want to use
  - To find installed models, type `ollama list` into a terminal
  - Or find interesting local models on https://ollama.com/library
- Configure API Endpoint
  - If you use a different port or run a remote ollama session

2. Generate a report:
   - Use the command palette and search for `Generate Daily Report`
   - The plugin will automatically collect today's notes and generate a summary

## Configuration

- `API Key`: Your LLM API key
- `API Endpoint`: API endpoint URL
- `Ollama Model`: Exact name of the Ollama model
- `Report Location`: Where to save daily reports (e.g., /Daily Reports)

## Supported Platforms

- [x] Windows
- [x] macOS
- [x] Linux

## Error Handling

The plugin includes comprehensive error logging:

- API call failures
- File operation errors
- Configuration issues
- All errors are logged to `debug-errors.md` in your specified report location

## License

[MIT License](LICENSE) - see the LICENSE file for details

## Author

Sarah W. 
Original plugin written by [Luke](https://github.com/CSLukkun) 

## Changelog

### v0.1.0
- Forked from original plugin - [Daily Summary](https://github.com/CSLukkun/ob_daily_summary).
- Renamed plugin to "Obsidian Daily Summary"
- Added ability to pull summaries for notes from previous days


