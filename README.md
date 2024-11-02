# Obsidian Daily Summary Plugin

An Obsidian plugin that automatically generates daily summaries. It collects notes from the current day and uses LLM to generate a concise daily report.

## Features

- Automatically identifies notes from the current day
- Uses LLM to generate intelligent summaries
- Customizable API settings
- Configurable report save location
- Quick access through command palette

## Installation

1. Open Obsidian Settings
2. Navigate to Third-party plugins
3. Disable Safe mode
4. Click Browse community plugins
5. Search for "Daily Summary"
6. Click Install

## Usage

1. After installation, configure the plugin settings:
   - Set your API Key
   - Configure API Endpoint
   - Set report save location

2. Generate a report:
   - Use the command palette and search for `Generate Daily Report`
   - The plugin will automatically collect today's notes and generate a summary

## Configuration

- `API Key`: Your LLM API key
- `API Endpoint`: API endpoint URL
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
Luke

## Changelog

### 1.0.6
- Initial release
- Basic daily report generation
- Settings interface implementation
- Error logging system
- Automatic date detection in filenames