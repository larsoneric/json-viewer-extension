# JSON Viewer Chrome Extension

A Chrome DevTools extension that helps you view and copy escaped JSON strings from network responses with proper formatting.

## Features

- **Automatic Network Monitoring**: Automatically monitors all JSON network requests
- **Full Response Viewing**: View and format any JSON response with syntax highlighting
- **Escaped JSON Detection**: Recursively scans JSON responses to find all properties containing escaped JSON (e.g., `"{\"name\":\"value\"}"`)
- **Syntax Highlighting**: Color-coded JSON for better readability (keys, strings, numbers, booleans, null)
- **Quick Actions**: For each JSON property:
  - **Format/Collapse**: Toggle between compact and formatted views with syntax highlighting
  - **Copy**: Copies the JSON to your clipboard (formatted or unformatted based on current view)
- **Property Paths**: Shows the full path to each property for easy identification
- **Request History**: Keep track of the last 20 JSON requests with property counts
- **Multilingual Support**: Built-in internationalization system (currently English)

## Installation

1. Create icon files (required):

   **Easiest method**: Open `generate-icons.html` in your browser, click "Generate Icons", then download each PNG file (icon16.png, icon48.png, icon128.png) and save them in the extension directory.

   **Alternative methods**:
   ```bash
   # Using ImageMagick:
   convert icon.svg -resize 16x16 icon16.png
   convert icon.svg -resize 48x48 icon48.png
   convert icon.svg -resize 128x128 icon128.png
   ```

   Or use an online SVG to PNG converter like:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select this directory

3. Open DevTools (F12 or Cmd+Option+I on Mac)
4. You'll see a new "JSON Viewer" tab in DevTools

## Usage

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Navigate to the **JSON Viewer** tab
3. Make network requests in your application
4. The extension automatically:
   - Monitors all JSON responses from the Network tab
   - Displays requests in a list with method, URL, and property count
   - Updates in real-time as new requests are made

5. When a JSON request is detected:
   - Click on any request in the list to view its details
   - The panel shows the request URL and method
   - Lists all JSON properties:
     - **[Full Response]**: The complete JSON response
     - Individual properties with escaped JSON (if any)
   - For each property, you can:
     - Click **Format** to expand and syntax highlight the JSON
     - Click **Collapse** to return to compact view
     - Click **Copy** to copy the JSON to your clipboard (preserves formatting state)

## Example

If your API returns something like:
```json
{
  "data": "{\"name\":\"John\",\"age\":30}",
  "status": "success",
  "metadata": {
    "user": "{\"id\":123,\"roles\":[\"admin\"]}"
  }
}
```

The JSON Viewer panel will automatically detect and display:

**Request**: `GET /api/user` (3 properties)

When selected, shows:
- **[Full Response]**: The entire JSON response
  **Actions**: [Format] [Copy]

- **data**: `"{\"name\":\"John\",\"age\":30}"`
  **Actions**: [Format] [Copy]

- **metadata.user**: `"{\"id\":123,\"roles\":[\"admin\"]}"`
  **Actions**: [Format] [Copy]

Clicking **Format** will unescape and syntax highlight the JSON with color coding:
```json
{
  "name": "John",    // keys in light blue, strings in orange
  "age": 30          // numbers in light green
}
```

## Development

### File Structure
- `manifest.json`: Extension configuration
- `devtools.html` / `devtools.js`: DevTools integration entry point
- `panel.html` / `panel.js`: Main panel UI and logic
- `i18n.js`: Internationalization system with translation strings
- `icon.svg`: Source icon (needs to be converted to PNG)
- `generate-icons.html`: Utility to generate PNG icons from SVG

### Adding Translations
To add a new language, edit `i18n.js`:

```javascript
const translations = {
  en: { /* existing English translations */ },
  es: {
    emptyStateTitle: 'Esperando solicitudes de red',
    formatButton: 'Formatear',
    // ... add all translation keys
  }
};
```

Then call `setLanguage('es')` to switch languages.

## Troubleshooting

**Extension won't load**: Make sure you've created the icon PNG files (icon16.png, icon48.png, icon128.png). Use `generate-icons.html` to create them easily.

**Panel shows "Waiting for Network Requests"**: Make network requests in your application. The extension monitors all JSON responses (Content-Type: application/json or javascript).

**Escaped JSON properties not detected**: The extension looks for string values that can be parsed as valid JSON objects or arrays. Make sure your escaped JSON is properly formatted.

**Syntax highlighting not working**: Make sure you click the "Format" button to expand the JSON. Syntax highlighting only appears in the formatted view.
