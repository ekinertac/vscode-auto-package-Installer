# Auto Package Installer Extension

This VS Code extension automatically detects missing packages in your JavaScript and TypeScript projects and offers to install them with a single click.

## Features

1. **Automatic Detection**: Detects missing packages in JavaScript and TypeScript files.

2. **Quick Fix Action**: Provides a "Quick Fix" action to install missing packages directly from the editor.

3. **Multiple Package Manager Support**: Automatically detects and uses the appropriate package manager for your project:

   - npm
   - Yarn
   - pnpm
   - Bun
   - Expo

4. **Expo Project Support**: Automatically detects Expo projects and uses the correct installation command.

5. **Nearest package.json Detection**: Finds the nearest package.json file in the project structure, allowing for monorepo setups.

6. **Informative Quick Fix Item**: The Quick Fix item shows the exact installation command that will be used, e.g., "Install package: npm install package-name".

7. **Progress Indicator**: Displays a progress notification while installing packages.

8. **Success/Error Messages**: Shows success or error messages after package installation attempts.

## How It Works

1. When you open a JavaScript or TypeScript file, the extension scans for import statements or require() calls that reference missing packages.

2. If a missing package is detected, a lightbulb icon appears next to the import statement.

3. Clicking on the lightbulb or using the Quick Fix shortcut (usually Alt+Enter or Cmd+.) will show the "Install package" option with the specific command to be used.

4. Selecting this option will:
   - Detect the nearest package.json file
   - Determine the appropriate package manager (npm, Yarn, pnpm, Bun, or Expo)
   - Run the installation command in the background
   - Show a progress notification
   - Display a success message upon completion or an error message if installation fails

## Supported Languages

- JavaScript
- TypeScript

## Requirements

- Visual Studio Code v1.90.0 or higher

## Extension Settings

This extension does not add any VS Code settings.

## Known Issues

[List any known issues here, or remove this section if there are none]

## Release Notes

### 1.0.0

Initial release of Auto Package Installer Extension

---

## Contributing

- Clone the repository
- Run `npm install` to install the dependencies

## License

This extension is licensed under the MIT License. See the LICENSE file for more details.
